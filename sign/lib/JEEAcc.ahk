#Include Acc.ahk

q:: ;Notepad - get Acc info (window)
WinGet, hWnd, ID, A
MsgBox, % Clipboard := JEE_AccGetTextAll(hWnd, "`r`n")

;Edit control info is: 4.1.4
;the acc path will be 4.1.4
;and we will use 0 with accValue()
oAcc := Acc_Get("Object", "4.1.4", 0, "ahk_id " hWnd)
MsgBox, % oAcc.accValue(0)
oAcc := ""

;status bar info is: 4.2.4 c2
;the acc path will be 4.2.4
;and we will use 2 with accName()
oAcc := Acc_Get("Object", "4.2.4", 0, "ahk_id " hWnd)
MsgBox, % oAcc.accName(2)
oAcc := ""
return

w:: ;Notepad - get Acc info (controls)
ControlGet, hCtl1, Hwnd,, Edit1, A
ControlGet, hCtl2, Hwnd,, msctls_statusbar321, A
MsgBox, % Clipboard := JEE_AccGetTextAll(hCtl1, "`r`n")
MsgBox, % Clipboard := JEE_AccGetTextAll(hCtl2, "`r`n")

;Edit control info is: 4
;the acc path will be 4
;and we will use 0 with accValue()
oAcc := Acc_Get("Object", "4", 0, "ahk_id " hCtl1)
MsgBox, % oAcc.accValue(0)
oAcc := ""

;status bar info is: 4 c2
;the acc path will be 4
;and we will use 2 with accName()
oAcc := Acc_Get("Object", "4", 0, "ahk_id " hCtl2)
MsgBox, % oAcc.accName(2)
oAcc := ""
return

;==================================================

JEE_StrRept(vText, vNum)
{
	if (vNum <= 0)
		return
	return StrReplace(Format("{:" vNum "}", ""), " ", vText)
	;return StrReplace(Format("{:0" vNum "}", 0), 0, vText)
}

;==================================================

; ;e.g.
; q::
; WinGet, hWnd, ID, A
; MsgBox, % Clipboard := JEE_AccGetTextAll(hWnd, "`r`n")
; return

; ;e.g.
; q::
; ControlGet, hCtl, Hwnd,, Edit1, A
; MsgBox, % Clipboard := JEE_AccGetTextAll(hCtl, "`r`n")
; return

; ;e.g.
; q::
; ControlGetFocus, vCtlClassNN, A
; ControlGet, hCtl, Hwnd,, % vCtlClassNN, A
; MsgBox, % Clipboard := JEE_AccGetTextAll(hCtl, "`r`n")
; return

;vOpt: space-separated list
;vOpt: n#: e.g. n20 ;limit retrieve name to first 20 characters
;vOpt: v#: e.g. v20 ;limit retrieve value to first 20 characters

JEE_AccGetTextAll(hWnd:=0, vSep:="`n", vIndent:="`t", vOpt:="")
{
	vLimN := 20, vLimV := 20
	Loop, Parse, vOpt, % " "
	{
		vTemp := A_LoopField
		if (SubStr(vTemp, 1, 1) = "n")
			vLimN := SubStr(vTemp, 2)
		else if (SubStr(vTemp, 1, 1) = "v")
			vLimV := SubStr(vTemp, 2)
	}

	oMem := {}, oPos := {}
	;OBJID_WINDOW := 0x0
	oMem[1, 1] := Acc_ObjectFromWindow(hWnd, 0x0)
	oPos[1] := 1, vLevel := 1
	VarSetCapacity(vOutput, 1000000*2)

	Loop
	{
		if !vLevel
			break
		if !oMem[vLevel].HasKey(oPos[vLevel])
		{
			oMem.Delete(vLevel)
			oPos.Delete(vLevel)
			vLevelLast := vLevel, vLevel -= 1
			oPos[vLevel]++
			continue
		}
		oKey := oMem[vLevel, oPos[vLevel]]

		vName := "", vValue := ""
		if IsObject(oKey)
		{
			vRoleText := Acc_GetRoleText(oKey.accRole(0))
			try vName := oKey.accName(0)
			try vValue := oKey.accValue(0)
		}
		else
		{
			oParent := oMem[vLevel-1,oPos[vLevel-1]]
			vChildId := IsObject(oKey) ? 0 : oPos[vLevel]
			vRoleText := Acc_GetRoleText(oParent.accRole(vChildID))
			try vName := oParent.accName(vChildID)
			try vValue := oParent.accValue(vChildID)
		}
		if (StrLen(vName) > vLimN)
			vName := SubStr(vName, 1, vLimN) "..."
		if (StrLen(vValue) > vLimV)
			vValue := SubStr(vValue, 1, vLimV) "..."
		vName := RegExReplace(vName, "[`r`n]", " ")
		vValue := RegExReplace(vValue, "[`r`n]", " ")

		vAccPath := ""
		if IsObject(oKey)
		{
			Loop, % oPos.Length() - 1
				vAccPath .= (A_Index=1?"":".") oPos[A_Index+1]
		}
		else
		{
			Loop, % oPos.Length() - 2
				vAccPath .= (A_Index=1?"":".") oPos[A_Index+1]
			vAccPath .= " c" oPos[oPos.Length()]
		}
		vOutput .= vAccPath "`t" JEE_StrRept(vIndent, vLevel-1) vRoleText " [" vName "][" vValue "]" vSep

		oChildren := Acc_Children(oKey)
		if !oChildren.Length()
			oPos[vLevel]++
		else
		{
			vLevelLast := vLevel, vLevel += 1
			oMem[vLevel] := oChildren
			oPos[vLevel] := 1
		}
	}
	return SubStr(vOutput, 1, -StrLen(vSep))
}
