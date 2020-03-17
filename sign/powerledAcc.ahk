#Include lib/LibCon.ahk
#Include lib/Acc.ahk

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

; Acc_Init()

WinMove, ahk_exe PowerLedLTS.exe, , 0, 0, 1750, 1500
WinGet, hWnd, ID, ahk_exe PowerLedLTS.exe

OpenCountBox() {
  global hWnd

  ; ### Text in Outline ###
  oAcc := Acc_Get("Object", "4.1.2.2.2.5", 0, "ahk_id " hWnd)
  oRect := Acc_Location(oAcc)
  vMouseX := oRect.x + oRect.w/6
  vMouseY := oRect.y + oRect.h/2
  oName := oAcc.accName(0)
  Click %vMouseX%, %vMouseY%

  if (InStr(oName, "Count") != 1) {
    puts("[WARN] Clicking on `" oName "` instead of `Count*`")
  }

  ; msgbox % vMouseX
  ; msgbox % vMouseY

  Sleep 10
  oAcc := ""
  oRect := ""
  oName := ""
}

EditTextBox() {
  global 1
  global hWnd

  ; ### Text in Outline ###
  oAcc := Acc_Get("Object", "4.1.2.1.3.7.1", 0, "ahk_id " hWnd)
  oRect := Acc_Location(oAcc)
  vMouseX := oRect.x + oRect.w/2
  vMouseY := oRect.y + oRect.h/2
  Click %vMouseX%, %vMouseY%

  ; msgbox % vMouseX
  ; msgbox % vMouseY
  Sleep, 10
  Send, ^a
  Sleep 10
  Send %1%
  ; msgbox %1%

  oAcc := ""
  oRect := ""
  oName := ""
}

LedSend() {
  global hWnd

  ; ### Send Button ###
  oAcc := Acc_Get("Object", "4.1.1.22", 0, "ahk_id " hWnd)
  oName := oAcc.accName(0)

  oAcc.accDoDefaultAction()
  ; msgbox % oAcc.accDefaultAction()

  if (oName != "Send") {
    puts("[WARN] Clicking on `" oName "` instead of `Send`")
  }

  oAcc := ""
  oName := ""
}

Sleep 10
OpenCountBox()
EditTextBox()
LedSend()

; Click, 1073, 1185
; Click, 602, 449
; Sleep, 10
; Send, ^a
; Sleep, 10
; Send %1%
; Sleep, 10

; ### Click "Send" ###
; Click, 1576, 149
; Click 1518, 158

Sleep 2000

CloseProgressWindow()

; TODO: title filtering is not working
if WinActive("Error ahk_exe PowerLedLTS.exe")
  ; WinClose
  puts("[AHK] ERROR: An unknown error occurred. Please try updating the sign manually for more information.")
  ExitApp, 1
