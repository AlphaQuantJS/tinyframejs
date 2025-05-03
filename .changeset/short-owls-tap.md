---
'tinyframejs': major
---

# First minimal working version

## WHAT
This is the first stable release of TinyFrameJS with a complete API for DataFrame operations. Major changes include:
- Replacement of the vulnerable xlsx library (v0.18.5) with exceljs (v4.4.0)
- Fixed imports of non-existent modules
- Added proper export of the cloneFrame function
- Fixed bug in sort.js where it called non-existent frame.clone() method

## WHY
These changes were necessary to:
- Address security vulnerabilities in the xlsx dependency
- Fix critical bugs that prevented proper library usage
- Ensure consistent API across the library
- Improve overall stability and reliability

## HOW TO UPDATE
If you were using a previous version:
- Replace any calls to frame.clone() with cloneFrame(frame)
- If you were directly using xlsx functionality, update to the exceljs API
- Review any import statements that might have been relying on the previously non-existent modules
