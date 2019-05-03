TEMPLATE = subdirs
SUBDIRS = ts src
TRANSLATIONS = \
    ts/piblocks_ca-es.ts \
    ts/piblocks_es-es.ts

macx {
    deploy.commands = macdeployqt $${OUT_PWD}/PiBlocks.app
    QMAKE_EXTRA_TARGETS += deploy
}

win32 {
    RC_ICONS = piblocks.ico
    deploy.commands = windeployqt --release $${OUT_PWD}/src/PiBlocks.exe
    QMAKE_EXTRA_TARGETS += deploy
}

win64 {
    RC_ICONS = piblocks.ico
    deploy.commands = windeployqt --release $${OUT_PWD}/src/PiBlocks.exe
    QMAKE_EXTRA_TARGETS += deploy
}
