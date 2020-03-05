#Include LibCon.ahk

#NoEnv
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input
SetWorkingDir %A_ScriptDir%

; #SingleInstance Force
; #InstallKeybdHook
; #InstallMouseHook

if (!WinActive("ahk_exe PowerLedLTS.exe"))
  WinActivate, ahk_exe PowerLedLTS.exe

if WinActive("Progress ahk_exe PowerLedLTS.exe")
  WinClose

if WinActive("Error ahk_exe PowerLedLTS.exe")
  WinClose

WinMove, ahk_exe PowerLedLTS.exe, , 0, 0, 1750, 1500

Click, 1073, 1185
; Click, 602, 449
Sleep, 10
Send, ^a
Sleep, 10
Send %1%
Sleep, 10
Click, 1576, 149
; Click 1518, 158
Sleep, 500

if WinActive("Progress ahk_exe PowerLedLTS.exe")
  WinClose

if WinActive("Error ahk_exe PowerLedLTS.exe")
  WinClose
  SmartStartConsole()
  puts("ERROR: An unknown error occurred. Please try updating the sign manually for more information.")
  ExitApp, 1
