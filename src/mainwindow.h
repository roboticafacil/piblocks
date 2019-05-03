#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include "graphwidget.h"
#include "jswebhelpers.h"
#include "settingsdialog.h"
#include "settingsstore.h"

#include <QMainWindow>
#include <QProcess>
#include <QtSerialPort/QSerialPort>
#include <QWebEngineView>
#include <QUndoStack>
#include <QSignalMapper>
#include <QDomDocument>

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();

private:
    Ui::MainWindow *ui;
    QProcess *process;
    SettingsStore *settings;
    QString xmlFileName;
    QString xmlLoadContent;
    QStringList serialPortList;
    QSerialPort *serial;
    QString dataString;
    QList<GraphWidget *> graphList;
    //QStringList documentHistory;
    QUndoStack documentHistory;
    QUndoCommand command;
    QString lastDocument;
    JsWebHelpers *webHelper;
    QWebChannel *channel;
    QTimer *licenseTimer;
    bool sourceChanging;
    bool sourceChanged;
    int documentHistoryStep;
    bool alert;
    QSignalMapper *signalMapper;

    void actionSaveAndSaveAs(bool askFileName, const QString &directory = "");
    void actionOpenInclude(const QString &title,
                           bool clear = true,
                           const QString &directory = "");
    void arduinoExec(const QString &action);
    void documentHistoryReset();
    QString evaluateJavaScript(const QString code);
    QString escapeCharacters(const QString& string);
    QString getXml();
    QString getCode();
    void setXml(const QString &xml, bool clear = false);
    void iconLabels();
    bool isCommaSeparatedNumbers(const QString data);
    bool listIsEqual(const QStringList &listOne, const QStringList &listTwo);
    void loadBlockly();
    void openFileToWorkspace(const QString &xmlFileName,
                             bool clear = true);
    void setArduinoBoard();
    void setXmlFileName(const QString &fileName);
    void serialPortOpen();
    void serialPortClose();
    QStringList portList();
    int saveXml(const QString &xmlFilePath);
    int saveSketch(const QString &inoFilePath);
    int checkSourceChanged();
    void closeEvent(QCloseEvent *bar);
    void initCategories();

protected:
    bool eventFilter(QObject *obj, QEvent *event);

public slots:
    void actionAbout();
    void actionCloseMessages();
    void actionCode();
    void actionDoc();
    void actionExamples();
    void actionExportSketch();
    void actionIconLabels();
    void actionInclude();
    void actionInjectWebHelper();
    void actionInsertLanguage();
    void actionMessages();
    void actionMonitor();
    void actionMonitorSend();
    void actionNew();
    void actionOpen();
    void actionOpenMessages();
    void actionGraph();
    void actionQuit();
    void actionDocumentRedo();
    void actionDocumentUndo();
    void actionUpload();
    void actionVerify();
    void actionSave();
    void actionSaveAs();
    void actionSettings();
    void actionZoomIn();
    void actionZoomOut();
    void onBoardChanged();
    void onLoadFinished(bool finished);
    void onProcessFinished(int exitCode);
    void onProcessOutputUpdated();
    void onProcessStarted();
    void onSourceChanged();
    void onStatusMessageChanged(const QString &message);
    void readSerial();
    void unhide();
    void updateSerialPorts();
private slots:
    void on_actionMonitor_triggered();
    //void on_actionblockMenuSelected_triggered();
    void onUndoChanged(bool canUndo);
    void onRedoChanged(bool canUndo);
    void on_actionCopy_triggered();
    void on_donation_released();
};

#endif // MAINWINDOW_H
