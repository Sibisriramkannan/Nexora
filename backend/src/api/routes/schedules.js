const router = require('express').Router();
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { ScanSchedule } = require('../../models');
const scheduler = require('../../scheduler');

router.use(auth);
const validate = (req,res,next)=>{ const e=validationResult(req); if(!e.isEmpty()) return res.status(400).json({success:false,errors:e.array()}); next(); };
router.get('/', async (req,res,next)=>{ try { const rows=await ScanSchedule.findAll({where:{created_by:req.user.id},order:[['created_at','DESC']]}); res.json({success:true,schedules:rows}); } catch(e){next(e);} });
router.post('/', body('name').isString().notEmpty(), body('cron').isString().notEmpty(), body('scan_type').isIn(['network','web','compliance','full']), body('targets').isArray({min:1}), validate, async(req,res,next)=>{
  try { scheduler.validateCron(req.body.cron); const row=await ScanSchedule.create({...req.body,created_by:req.user.id}); scheduler.register(row); res.status(201).json({success:true,schedule:row}); } catch(e){next(e);}
});
router.patch('/:id', param('id').isUUID(), validate, async(req,res,next)=>{ try { const row=await ScanSchedule.findOne({where:{id:req.params.id,created_by:req.user.id}}); if(!row)return res.status(404).json({success:false,message:'Schedule not found'}); if(req.body.cron)scheduler.validateCron(req.body.cron); await row.update(req.body); scheduler.register(row); res.json({success:true,schedule:row}); }catch(e){next(e);} });
router.delete('/:id', param('id').isUUID(), validate, async(req,res,next)=>{ try { const row=await ScanSchedule.findOne({where:{id:req.params.id,created_by:req.user.id}}); if(!row)return res.status(404).json({success:false,message:'Schedule not found'}); scheduler.unregister(row.id); await row.destroy(); res.json({success:true}); }catch(e){next(e);} });
module.exports=router;
