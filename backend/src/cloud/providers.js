const providers = [
  { id:'aws', name:'Amazon Web Services', status:'adapter-ready', services:['EC2','ECS','EKS','Lambda','RDS','DynamoDB','S3','ALB','ELB','VPC','CloudFront','SQS','SNS','ElastiCache','OpenSearch','API Gateway','CloudWatch'] },
  { id:'azure', name:'Microsoft Azure', status:'adapter-ready', services:['Virtual Machines','AKS','Functions','App Service','Azure SQL','Storage','Load Balancer','Application Gateway','Cosmos DB','Event Hubs','Service Bus','Monitor'] },
  { id:'gcp', name:'Google Cloud', status:'adapter-ready', services:['Compute Engine','GKE','Cloud Run','Cloud Functions','Cloud SQL','GCS','Load Balancing','Pub/Sub','BigQuery','Memorystore','Cloud Monitoring'] },
  { id:'oci', name:'Oracle Cloud Infrastructure', status:'adapter-ready', services:['Compute','OKE','Autonomous Database','Load Balancer','Object Storage','VCN','Monitoring'] },
  { id:'kubernetes', name:'Kubernetes', status:'native', services:['Nodes','Pods','Deployments','StatefulSets','DaemonSets','Services','Ingress','Events'] },
  { id:'docker', name:'Docker', status:'native', services:['Containers','Images','Networks','Volumes','Healthchecks'] },
  { id:'onprem', name:'On-Prem / Hybrid', status:'native', services:['Linux','Windows','VMware','SNMP','HTTP','TCP','DNS','ICMP'] }
];
function listProviders(){ return providers; }
function getProvider(id){ return providers.find(p => p.id === id); }
module.exports = { listProviders, getProvider };
