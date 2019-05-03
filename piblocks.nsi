; facilino_junior.nsi
;
; This script is based on example2.nsi, but it remember the directory, 
; has uninstall support and (optionally) installs start menu shortcuts.
;
; It will install facilino_junior.nsi into a directory that the user selects,

;--------------------------------

; The name of the installer
Name "Facilino Junior"

; The file to write
OutFile "facilino_junior_1_0_0_win64.exe"

; The default installation directory
InstallDir "C:\Facilino Junior"

; Registry key to check for directory (so if you install again, it will 
; overwrite the old one automatically)
InstallDirRegKey HKLM "Software\Facilino Junior" "Install_Dir"

; Request application privileges for Windows Vista
RequestExecutionLevel admin

BrandingText "Robótica Fácil"

!include "MUI2.nsh"

!define MUI_ICON "facilino_junior.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "facilino_junior.bmp" ; optional
!define MUI_HEADERIMAGE_RIGHT

;--------------------------------

Function .onInit
StrCpy $INSTDIR "C:\Facilino Junior"
System::Call 'kernel32::CreateMutex(p 0, i 0, t "myMutex") p .r1 ?e'
 Pop $R0
 
 StrCmp $R0 0 +3
   MessageBox MB_OK|MB_ICONEXCLAMATION "The installer is already running."
   Abort
FunctionEnd

; Pages

; Page components
; Page directory
; Page instfiles
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; UninstPage uninstConfirm
; UninstPage instfiles
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

;--------------------------------
!include x64.nsh

; The stuff to install
Section "Facilino Junior (required)"

  SectionIn RO
  
  ; Set output path to the installation directory.
  SetOutPath $INSTDIR
  
  ; Checks Vc++ redistribution package is installed
  ReadRegStr $1 HKLM "SOFTWARE\WOW6432Node\Microsoft\DevDiv\vc\Servicing\12.0\RuntimeMinimum" "Install"
  StrCmp $1 1 VC_INSTALLED
  ;MessageBox MB_OK|MB_ICONINFORMATION "Visual C++ Redistributable package not detected. Please install or repair!" IDOK VC_INSTALL
  ExecWait '"$INSTDIR\vcredist_x64.exe"'
  VC_INSTALLED:
  ReadRegStr $1 HKLM "SOFTWARE\WOW6432Node\Arduino" "Install_Dir"
  StrCmp $1 "" ARDUINO_NOT_INSTALLED
  Goto ARDUINO_INSTALLED
  ARDUINO_NOT_INSTALLED:
  MessageBox MB_OK|MB_ICONINFORMATION "You must have Arduino IDE installed in order to compile programs!" IDOK ARDUINO_DOWNLOAD
  ARDUINO_DOWNLOAD:
  NSISdl::download "https://downloads.sourceforge.net/project/facilino/Arduino/arduino-1.8.7-windows.exe" "$INSTDIR\arduino-1.8.7-windows.exe" 
  ExecWait '"$INSTDIR\arduino-1.8.7-windows.exe"'
  Delete "$INSTDIR\arduino-1.8.7-windows.exe"
  ARDUINO_INSTALLED:
  
  ; Put file there
  File /nonfatal /a /r "src\" #note back slash at the end
  
  ; Write the installation path into the registry
  WriteRegStr HKLM "SOFTWARE\Facilino Junior" "Install_Dir" "$INSTDIR"
  
  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Facilino Junior" "DisplayName" "Facilino Junior"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Facilino Junior" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Facilino Junior" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Facilino Junior" "NoRepair" 1
  WriteUninstaller "uninstall.exe"
SectionEnd

; Optional section (can be disabled by the user)
Section "Start Menu & Desktop Shortcuts"

  CreateDirectory "$SMPROGRAMS\Facilino Junior"
  CreateShortcut "$SMPROGRAMS\Facilino Junior\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  CreateShortcut "$SMPROGRAMS\Facilino Junior\Facilino Junior.lnk" "$INSTDIR\facilino_junior.exe" "" "$INSTDIR\facilino_junior.ico" 0
  CreateShortCut "$DESKTOP\Facilino Junior.lnk" "$INSTDIR\facilino_junior.exe" "" "$INSTDIR\facilino_junior.ico" 0
  
SectionEnd

;--------------------------------

; Uninstaller

Section "Uninstall"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Facilino Junior"
  DeleteRegKey HKLM "SOFTWARE\Facilino Junior"

  ; Remove files and uninstaller
  Delete "$INSTDIR\*.*"

  ; Remove shortcuts, if any
  Delete "$SMPROGRAMS\Facilino Junior\*.*"
  Delete "$DESKTOP\Facilino Junior.lnk"

  ; Remove directories used
  RMDir /r "$SMPROGRAMS\Facilino Junior"
  RMDir /r "$INSTDIR"
SectionEnd
