import http from 'k6/http';
import {check, sleep} from 'k6';

const HTML_FILE_PATH = '/data/sample.html';
const SHARED_SECRET = __ENV.SHARED_SECRET || 'mysecret';
const BASE_URL = 'http://pdf-service:3000/pdf';

const html = open(HTML_FILE_PATH);

// This scenario is tuned for a single vCPU:
// - start with low RPS
// - ramp up slowly
// - you can watch where latency explodes
export const options = {
    scenarios: {
        pdf_load: {
            executor: 'ramping-arrival-rate',
            startRate: 1,        // 1 request/sec at start
            timeUnit: '1s',
            preAllocatedVUs: 20, // how many VUs to pre-allocate
            maxVUs: 50,          // safety ceiling
            stages: [
                {target: 2, duration: '30s'},  // 2 RPS
                {target: 4, duration: '30s'},  // 4 RPS
                {target: 6, duration: '30s'},  // 6 RPS
                {target: 8, duration: '30s'},  // 8 RPS (likely near the limit on 1 vCPU)
                {target: 0, duration: '10s'},  // ramp down
            ],
        },
    },
};


export default function () {
    const payload = {
        file: http.file(html, 'sample.html', 'text/html'),
    };

    const res = http.post(BASE_URL, payload, {
        headers: {
            'x-shared-secret': SHARED_SECRET,
        },
        timeout: '120s', // PDF generation can be slow under load
    });

    console.log(`status=${res.status} body=${String(res.body).slice(0, 80)}`);

    check(res, {
        'status is 200': (r) => r.status === 200,
        'is pdf': (r) => String(r.headers['Content-Type'] || '').includes('application/pdf'),
    });

    // small think time between iterations
    sleep(1);
}