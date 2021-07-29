import * as profiler_core from '../crate/pkg/shell';
import * as model from './model';

console.log("I WAS HERE");

const worker: Worker = self as any;
self.addEventListener('message', e => {
    if (!e.type) return;
    switch (e.type) {
        case model.WorkerRequestType.REGISTER_FILE:
            console.log("REGISTER FILE");
            break;
        default:
            console.log(`UNKNOWN REQUEST TYPE ${e.type}`);
    }

    console.log(event);
});