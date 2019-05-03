TEMPLATE = aux

linux {
  first.commands = lupdate /home/roboticafacil/src/facilino_junior/facilino_junior.pro && lrelease /home/roboticafacil/src/facilino_junior/facilino_junior.pro
  QT += webkitwidgets
  QMAKE_EXTRA_TARGETS += first
}

win32 {
  first.commands = lupdate $$PWD/../facilino_junior.pro && lrelease $$PWD/../facilino_junior.pro
  QMAKE_EXTRA_TARGETS += first
}


QMAKE_CLEAN += *.qm
