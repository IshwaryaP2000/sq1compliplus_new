import * as webVitals from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    webVitals.getCLS(onPerfEntry);
    webVitals.getFID(onPerfEntry);
    webVitals.getFCP(onPerfEntry);
    webVitals.getLCP(onPerfEntry);
    webVitals.getTTFB(onPerfEntry);
  }
};

export default reportWebVitals;

