const cron=require('node-cron');
const {ScanSchedule,Scan}=require('../models');
const jobs=new Map();
function validateCron(expr){ if(!cron.validate(expr)) throw new Error('Invalid cron expression'); }
async function execute(row){
  const now=new Date();
  await row.update({last_run_at:now,last_status:'started'});
  try {
    const scan=await Scan.create({name:`${row.name} - ${now.toISOString()}`,type:row.scan_type,targets:row.targets,options:row.profile,status:'pending',created_by:row.created_by});
    await row.update({last_status:'queued'});
    const io=global.__nexoraIo; if(io) io.to(`user:${row.created_by}`).emit('security:scan:queued',{schedule_id:row.id,scan_id:scan.id,name:scan.name});
    return scan;
  } catch(e){ await row.update({last_status:'failed'}); throw e; }
}
function unregister(id){const job=jobs.get(id); if(job){job.stop();jobs.delete(id);}}
function register(row){unregister(row.id); if(!row.enabled)return; validateCron(row.cron); const job=cron.schedule(row.cron,()=>execute(row).catch(e=>console.error('[Scheduler]',e.message)),{timezone:row.timezone}); jobs.set(row.id,job);}
async function start(){const rows=await ScanSchedule.findAll({where:{enabled:true}}); rows.forEach(register); console.log(`⏱️ Security scheduler loaded: ${rows.length} schedules`);}
module.exports={start,register,unregister,validateCron,execute};
