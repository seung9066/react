@echo off
REM React 프로젝트 디렉토리로 이동
cd /d C:\Users\SGG\Desktop\dev\prj\test\react\react\react-test

REM React 개발 서버 실행 (새 창에서)
start cmd /k "npm run dev"

REM Python 백엔드 디렉토리로 이동
cd python-backend

REM Python 백엔드 서버 실행 (새 창에서)
start cmd /k "python app.py"

cd ../spring-backend
start cmd /k "mvnw.cmd spring-boot:run"

start chrome http://localhost:5173

REM 배치 파일 종료
exit
