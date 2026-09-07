const router = require('express').Router();
const auth = require('../middleware/auth');
const { listProviders, getProvider } = require('../../cloud/providers');

router.use(auth);
router.get('/providers', (req,res)=>res.json({success:true, providers:listProviders()}));
router.get('/providers/:id', (req,res)=>{
  const provider = getProvider(req.params.id);
  if(!provider) return res.status(404).json({success:false,message:'Provider not found'});
  res.json({success:true, provider});
});
router.get('/capabilities', (req,res)=>res.json({success:true, realtime:true, telemetry:['metrics','logs','traces','events'], providers:listProviders().map(p=>p.id)}));
module.exports = router;
