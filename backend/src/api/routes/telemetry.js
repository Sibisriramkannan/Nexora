const router=require('express').Router();
const auth=require('../middleware/auth');
const {ingestMetric,ingestLog,ingestTrace}=require('../../telemetry/ingest');
router.use(auth);
router.post('/metrics',(req,res,next)=>{try{res.status(202).json({success:true,event:ingestMetric({io:req.app.get('io'),metric:req.body})});}catch(e){next(e);}});
router.post('/logs',(req,res,next)=>{try{res.status(202).json({success:true,event:ingestLog({io:req.app.get('io'),log:req.body})});}catch(e){next(e);}});
router.post('/traces',(req,res,next)=>{try{res.status(202).json({success:true,event:ingestTrace({io:req.app.get('io'),trace:req.body})});}catch(e){next(e);}});
module.exports=router;
