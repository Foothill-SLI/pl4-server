#Include lib/LibCon.ahk

#NoEnv
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input
SetWorkingDir %A_ScriptDir%

; #SingleInstance Force
; #InstallKeybdHook
; #InstallMouseHook

SmartStartConsole()

CloseProgressWindow() {
  Loop {
    if WinExist("Progress ahk_exe PowerLedLTS.exe") {
      WinActivate
      if WinActive() {
        puts("[AHK] Trying to close `Progress` window...")
        WinClose
      }
      Sleep 500
    } else {
      Sleep 100
      if WinExist("Progress ahk_exe PowerLedLTS.exe") {
        CloseProgressWindow()
      } else {
        puts("[AHK] `Progress` window does not exist")
      }
      break
    }
  }
}

if (!WinActive("ahk_exe PowerLedLTS.exe"))
  WinActivate, ahk_exe PowerLedLTS.exe

CloseProgressWindow()

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
; Click, 1576, 149
Click 1518, 158
Sleep 2000

CloseProgressWindow()

; TODO: title filtering is not working
if WinActive("Error ahk_exe PowerLedLTS.exe")
  ; WinClose
  puts("[AHK] ERROR: An unknown error occurred. Please try updating the sign manually for more information.")
  ExitApp, 1
