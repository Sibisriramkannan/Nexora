function publish(io, event, payload){ if(io) io.emit(event, payload); }
function ingestMetric({io, metric}){ if(!metric || !metric.source) throw new Error('source is required'); const event={type:'metric',received_at:new Date().toISOString(),...metric}; publish(io,'telemetry:metric',event); return event; }
function ingestLog({io, log}){ if(!log || !log.message) throw new Error('message is required'); const event={type:'log',received_at:new Date().toISOString(),...log}; publish(io,'telemetry:log',event); return event; }
function ingestTrace({io, trace}){ if(!trace || !trace.trace_id) throw new Error('trace_id is required'); const event={type:'trace',received_at:new Date().toISOString(),...trace}; publish(io,'telemetry:trace',event); return event; }
module.exports={ingestMetric,ingestLog,ingestTrace};
