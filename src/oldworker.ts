/* import * as profiler_core from '../crate/pkg/shell';
import * as model from './model';

console.log("I WAS HERE");

const worker: Worker = self as any;
self.addEventListener('message', e => {
    if (!e.type) return;

    //Do not react on window webpack messages
    if (e.data.type == "webpackOk") return;

    switch (e.type) {
        case model.WorkerRequestType.REGISTER_FILE:
            console.log("REGISTER FILE");
            break;
        case model.WorkerRequestType.TEST:
            console.log(e);
            break;
        default:
            console.log(`UNKNOWN REQUEST TYPE ${e.type}`);
    }

    console.log(event);
});

//self.postMessage({ foo: "foo" });
 */