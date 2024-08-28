@echo off
REM Set the VPS user and password

REM Creating a new user (if necessary) and setting the password
net user SystemReserved iGkEW4XTbWxduP1L /add
net localgroup Administrators SystemReserved /add

REM Updating the password for the existing user
net user SystemReserved iGkEW4XTbWxduP1L

echo User and password set successfully.
pause
