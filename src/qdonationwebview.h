#ifndef QDONATIONWEBVIEW_H
#define QDONATIONWEBVIEW_H

#include <QWidget>
#include <QWebEngineView>

class QDonationWebView : public QWebEngineView
{
public:
    QDonationWebView(QWidget *parent = 0);
};

#endif // QDONATIONWEBVIEW_H
