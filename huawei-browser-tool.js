javascript: spreadName();
monitor = [1, 3, 5, 8, 20, 28, 38, 40, 41];
mainband = null;
_2ndrun = null;
suspend = 0;
function currentBand() {
    if (suspend == 1) return;
    console.log('Get Signal');
    $('#dhcp_mask').show();
    $('#dhcp_dns').show();
    $.ajax({
        type: 'GET',
        async: true,
        url: '/api/device/signal',
        error: function (request, status, error) {
            alert(
                'Signal Error:' +
                    request.status +
                    '\n' +
                    'message:' +
                    request.responseText +
                    '\n' +
                    'error:' +
                    error
            );
        },
        success: function (data) {
            vars = [
                'rssi',
                'rsrp',
                'rsrq',
                'sinr',
                'dlbandwidth',
                'ulbandwidth',
                'band',
                'cell_id',
                'pci',
                'nei_cellid',
                'plmn',
                'tac',
                'ulfrequency',
                'dlfrequency',
            ];
            for (i = 0; i < vars.length; i++) {
                window[vars[i]] = extractXML(vars[i], data);
                $('#' + vars[i]).html(window[vars[i]]);
            }
            hex = Number(cell_id).toString(16);
            hex2 = hex.substring(0, hex.length - 2);
            enbid = parseInt(hex2, 16).toString();
            $('#enbid').html(enbid);
            hex = Number(cell_id).toString(16);
            hex2 = hex.substring(5, hex.length - 0);
            enbidS = parseInt(hex2, 16).toString();
            $('#enbidS').html(enbidS);
            plmnMC = plmn.slice(0, 3);
            plmnMN = plmn.slice(-2);
            setgraph('rsrp', rsrp, -130, -51);
            setgraphRsrq('rsrq', rsrq, -20, -2);
            setgraphSinr('sinr', sinr, -4, 30);
        },
    });
    console.log('Get Net Mode');
    $.ajax({
        type: 'GET',
        async: true,
        url: '/api/net/net-mode',
        error: function (request, status, error) {
            alert(
                'Signal Error:' +
                    request.status +
                    '\n' +
                    'message:' +
                    request.responseText +
                    '\n' +
                    'error:' +
                    error
            );
        },
        success: function (data) {
            lteband = extractXML('LTEBand', data);
            $('#allowed').html(_4GType(lteband));
        },
    });
    $.ajax({
        type: 'GET',
        async: true,
        url: '/api/net/current-plmn',
        error: function (request, status, error) {
            alert(
                'Signal Error:' +
                    request.status +
                    '\n' +
                    'message:' +
                    request.responseText +
                    '\n' +
                    'error:' +
                    error
            );
        },
        success: function (data) {
            vars = ['ShortName', 'FullName', 'Rat'];
            for (i = 0; i < vars.length; i++) {
                window[vars[i]] = extractXML(vars[i], data);
                $('#' + vars[i]).html(window[vars[i]]);
            }
        },
    });
    $.ajax({
        type: 'GET',
        async: true,
        url: '/api/device/information',
        error: function (request, status, error) {
            alert(
                'Signal Error:' +
                    request.status +
                    '\n' +
                    'message:' +
                    request.responseText +
                    '\n' +
                    'error:' +
                    error
            );
        },
        success: function (data) {
            vars = ['DeviceName', 'ProductFamily', 'Classify', 'spreadname_en'];
            for (i = 0; i < vars.length; i++) {
                window[vars[i]] = extractXML(vars[i], data);
                $('#' + vars[i]).html(window[vars[i]]);
            }
        },
    });
    $.ajax({
        type: 'GET',
        async: true,
        url: '/api/monitoring/status',
        error: function (request, status, error) {
            alert(
                'Signal Error:' +
                    request.status +
                    '\n' +
                    'message:' +
                    request.responseText +
                    '\n' +
                    'error:' +
                    error
            );
        },
        success: function (data) {
            vars = [
                'ConnectionStatus',
                'WanIPAddress',
                'CurrentNetworkType',
                'CurrentNetworkTypeEx',
                'SignalIcon',
            ];
            for (i = 0; i < vars.length; i++) {
                window[vars[i]] = extractXML(vars[i], data);
                $('#' + vars[i]).html(window[vars[i]]);
            }
            setgraphSignal('SignalIcon', SignalIcon, 0, 5);
            if (CurrentNetworkTypeEx == '1011') {
                netTypeEx = 'LTE CA(4G+)';
            } else if (CurrentNetworkTypeEx == '101') {
                netTypeEx = 'LTE(4G)';
            }
            document.getElementById('netTypeEx').innerHTML = netTypeEx;
        },
    });
}
function extractXML(tag, data) {
    try {
        return data.split('</' + tag + '>')[0].split('<' + tag + '>')[1];
    } catch (err) {
        return err.message;
    }
}
function setgraph(p, val, min, max) {
    val = parseInt(val.replace(/\dBm/g, ''));
    x = ((val - min) / (max - min)) * 100;
    xs = String(x) + '%';
    e = '#' + p + 'b';
    $(e).width(xs);
    $(e).html('📶 ' + p + ' : ' + window[p]);
    if (x < 10) {
        $(e).css('background-color', 'rgba(255,0,0,0.8)').css('color', 'white');
    } else if (x > 10 && x < 50) {
        $(e)
            .css('background-color', 'rgba(255,50,0,0.8)')
            .css('color', 'white');
    } else if (x > 50 && x < 65) {
        $(e).css('background-color', 'rgba(50,50,0,0.8)').css('color', 'white');
    } else if (x > 65 && x < 75) {
        $(e)
            .css('background-color', 'rgba(50,100,0,0.8)')
            .css('color', 'white');
    } else if (x > 75 && x < 83) {
        $(e).css('background-color', 'rgba(0,200,0,0.8)').css('color', 'black');
    } else {
        $(e).css('background-color', 'rgba(0,255,0,0.8)').css('color', 'black');
    }
}
function setgraphRsrq(p, val, min, max) {
    val = parseInt(val.replace(/\dB/g, ''));
    x = ((val - min) / (max - min)) * 100;
    xs = String(x) + '%';
    e = '#' + p + 'b';
    $(e).width(xs);
    $(e).html('📶 ' + p + ' : ' + window[p]);
    if (x < 6) {
        $(e).css('background-color', 'rgba(255,0,0,0.8)').css('color', 'white');
    } else if (x > 6 && x < 28) {
        $(e)
            .css('background-color', 'rgba(255,50,0,0.8)')
            .css('color', 'white');
    } else if (x > 28 && x < 55) {
        $(e).css('background-color', 'rgba(50,50,0,0.8)').css('color', 'white');
    } else if (x > 55 && x < 70) {
        $(e)
            .css('background-color', 'rgba(50,100,0,0.8)')
            .css('color', 'white');
    } else if (x > 70 && x < 83) {
        $(e).css('background-color', 'rgba(0,200,0,0.8)').css('color', 'black');
    } else {
        $(e).css('background-color', 'rgba(0,255,0,0.8)').css('color', 'black');
    }
}
function setgraphSinr(p, val, min, max) {
    val = parseInt(val.replace(/\[>=]30/g, '30').replace(/\dB/g, ''));
    x = ((val - min) / (max - min)) * 100;
    xs = String(x) + '%';
    e = '#' + p + 'b';
    $(e).width(xs);
    $(e).html('📶 ' + p + ' : ' + window[p]);
    if (x < 11) {
        $(e).css('background-color', 'rgba(255,0,0,0.8)').css('color', 'white');
    } else if (x > 11 && x < 40) {
        $(e)
            .css('background-color', 'rgba(255,50,0,0.8)')
            .css('color', 'white');
    } else if (x > 40 && x < 55) {
        $(e).css('background-color', 'rgba(50,50,0,0.8)').css('color', 'white');
    } else if (x > 55 && x < 70) {
        $(e)
            .css('background-color', 'rgba(50,100,0,0.8)')
            .css('color', 'white');
    } else if (x > 70 && x < 82) {
        $(e).css('background-color', 'rgba(0,200,0,0.8)').css('color', 'black');
    } else {
        $(e).css('background-color', 'rgba(0,255,0,0.8)').css('color', 'black');
    }
}
function setgraphSignal(p, Sig, min, max) {
    x = ((Sig - min) / (max - min)) * 100;
    xs = String(x) + '%';
    e = '#' + p + 'b';
    $(e).width(xs);
    $(e).html('📶 ' + p + ' : ' + window[p]);
    if (x < 1) {
        $(e)
            .css('background-color', 'rgba(255,50,0,0.8)')
            .css('color', 'white');
    } else if (x > 1 && x < 2) {
        $(e).css('background-color', 'rgba(50,50,0,0.8)').css('color', 'white');
    } else if (x > 2 && x < 3) {
        $(e)
            .css('background-color', 'rgba(50,100,0,0.8)')
            .css('color', 'white');
    } else if (x > 3 && x < 4) {
        $(e).css('background-color', 'rgba(0,200,0,0.8)').css('color', 'black');
    } else {
        $(e).css('background-color', 'rgba(0,255,0,0.8)').css('color', 'black');
    }
}
function _4GType(data) {
    {
        if (data == '20800800C5') {
            return 'AUTO';
        }
        data_out = '';
        for (x = 0; x < monitor.length; x++) {
            tb = Math.pow(2, monitor[x] - 1);
            var t;
            if (tb < 0x100000000) {
                t = parseInt(data, 16) & tb;
            } else {
                t = (parseInt(data, 16) / 0x100000000) & (tb / 0x100000000);
            }
            if (t != 0) {
                data_out += 'B' + String(monitor[x]) + '+';
            }
        }
        data_out = data_out.replace(/\++$/, '');
        return data_out;
    }
}
function ltebandselection(bs) {
    console.log('CALLED' + bs);
    if (mainband) mainband = null;
    if (arguments.length == 0) {
        var band = prompt(
            "Please input the desired LTE band number. If you want to use multiple LTE bands, enter multiple range numbers (example 1+3 or 3+28 or 28+41). If you want to use all supported bands, Enter'AUTO'.",
            'AUTO'
        );
        if (band) band = band.toLowerCase();
        if (band == null || band === '') {
            return;
        }
    } else var band = arguments[0];
    var bs = band.split('+');
    var ltesum = 0;
    if (band.toUpperCase() === 'AUTO') {
        ltesum = '7FFFFFFFFFFFFFFF';
    } else {
        for (var i = 0; i < bs.length; i++) {
            if (bs[i].toLowerCase().indexOf('m') != -1) {
                bs[i] = bs[i].replace('m', '');
                mainband = bs[i];
            }
            if (bs[i].toUpperCase() === 'AUTO') {
                ltesum = '7FFFFFFFFFFFFFFF';
                break;
            } else ltesum = ltesum + Math.pow(2, parseInt(bs[i]) - 1);
        }
        ltesum = ltesum.toString(16);
    }
    if (mainband) {
        console.log('Set Main');
        _2ndrun = bs;
        ltebandselection(String(mainband));
        return;
    }
    suspend = 1;
    $.ajax({
        type: 'GET',
        async: true,
        url: '/html/home.html',
        error: function (request, status, error) {
            alert(
                'Token Error:' +
                    request.status +
                    '\n' +
                    'message:' +
                    request.responseText +
                    '\n' +
                    'error:' +
                    error
            );
        },
        success: function (data) {
            var datas = data.split('name="csrf_token" content="');
            var token = datas[datas.length - 1].split('"')[0];
            setTimeout(function () {
                $.ajax({
                    type: 'POST',
                    async: true,
                    url: '/api/net/net-mode',
                    headers: { __RequestVerificationToken: token },
                    contentType: 'application/xml',
                    data:
                        '<request><NetworkMode>03</NetworkMode><NetworkBand>3FFFFFFF</NetworkBand><LTEBand>' +
                        ltesum +
                        '</LTEBand></request>',
                    success: function (nd) {
                        console.log('success netmode');
                        $('#band').html(
                            '<span style="color:indigo;">- OK -</span>'
                        );
                        if (_2ndrun) {
                            console.log('Wait 2s');
                            window.setTimeout(function () {
                                console.log('Launch Netmode');
                                ltebandselection(_2ndrun.join('+'));
                                _2ndrun = false;
                            }, 2000);
                        } else {
                            suspend = 0;
                        }
                    },
                    error: function (request, status, error) {
                        alert(
                            'Net Mode Error:' +
                                request.status +
                                '\n' +
                                'message:' +
                                request.responseText +
                                '\n' +
                                'error:' +
                                error
                        );
                    },
                });
            }, 2000);
        },
    });
}
window.setInterval(currentBand, 2500);

function spreadName() {
    $('html').prepend(
        '<style> </style> <style> .vall{font-size:1.2em;color:#04a;} .valll{font-size:1.2em;font-weight:bold;color:blue;}</style> <div style="width:1300px;padding:4px 1px;margin:0 auto;"> <span <div style="font-size:1.2em;font-weight:600;color: #9d9dff;" id="netType"></span>&nbsp; <div style="display:inline;"><span class="valll" id="FullName"> </span>&nbsp; <div style="display:inline;margin-left:300px;font-size:1em;font-weight:600;color: #c2172d;"><span class="vall" id="spreadname_en"> </span>&nbsp;&nbsp;&nbsp; Model: <span class="vall"  id="ProductFamily"> </span> &nbsp;<span class="vall" id="DeviceName"> </span>&nbsp; </div> </div> '
    );
    {
        {
            $('body').prepend(
                '<style> .val{color:red;} </style> <div style="width:1300px;padding:4px;margin:0 auto;left:30;"> <div style="display:inline;margin-left:60px;"> UL:<span class="val" id="ulfrequency">0</span>&nbsp;&nbsp; DL:<span class="val" id="dlfrequency">0</span>&nbsp;&nbsp; <div style="display:inline;margin-left:400px;"> RSRP:<span class="val" id="rsrp">0</span>&nbsp;&nbsp; RSSI:<span class="val" id="rssi">0</span>&nbsp;&nbsp; RSRQ:<span class="val" id="rsrq">0</span>&nbsp;&nbsp; SINR:<span class="val" id="sinr">0</span>&nbsp;&nbsp; </div> </div> '
            );
        }
        {
            $('body').prepend(
                '<style> </style> <div style="width:1300px;padding:4px;margin:0 auto;left:30;"> <div style="display:inline;margin-left:60px;"> <span id="netTypeEx"></span> B<span class="val" id="band">0</span>(<span class="val" id="dlbandwidth">0</span>/<span class="val" id="ulbandwidth">0</span>)&nbsp; SET:<span class="val" id="allowed">0</span>&nbsp;&nbsp; <div style="display:inline;margin-left:50px;"> PLMN:<span class="val" id="plmn"> </span>&nbsp;&nbsp; TAC:<span class="val" id="tac"> </span>&nbsp;&nbsp; CELL ID:<span class="val" id="cell_id">0</span> &nbsp;&nbsp;  ENB ID:<span class="val" id="enbid">0</span></a>&nbsp;&nbsp; Sec ID:<span class="val" id="enbidS">0</span> &nbsp;&nbsp; PCI:<span class="val" id="pci">0</span></a>&nbsp;&nbsp;&nbsp; NearbyPCI:<span class="val" id="nei_cellid">0</span></a>&nbsp;&nbsp;&nbsp; </div> </div> '
            );
        }
        var input = document.createElement('input');
        input.type = 'button';
        input.value = 'BAND FREQUENCY';
        input.onclick = showBANDS;
        input.setAttribute(
            'style',
            'font-size:100%;font-weight:bold;margin-right:30px;color:#04a;text-decoration:underline;position:absolute;top:32px;left:3px;'
        );
        document.body.appendChild(input);
        function showBANDS() {
            ltebandselection();
        }
        function addGraph() {
            $('.headcontainer').slideUp();
            $('body').prepend(
                '<div style="width:1300px;position:absolute;top:156px;padding-left:10px;"><style> .p{border:10px;width:auto;padding-top:3px;height:30px;} .ps{border:1px;padding-top:2px;width:auto;height:13px;} .v{border-radius: 5px 25px 25px 5px;font-size:150%;height:30px;}.vs{border-radius: 5px 25px 25px 5px;font-size:75%;height:13px;} </style> <div class="ps"><div class="vs" id="SignalIconb"></div></div> <div class="p"><div class="v" id="rsrpb"></div></div> <div class="p"> <div class="v" id="rsrqb"></div></div> <div class="p"><div class="v" id="sinrb"></div></div>'
            );
            var input = document.createElement('input');
            input.type = 'button';
            input.value = '⫷RELOAD PAGE⫸';
            input.onclick = showReload;
            input.setAttribute(
                'style',
                'font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:55px;left:3px;'
            );
            document.body.appendChild(input);
            function showReload() {
                window.location.reload();
            }
        }
        var input = document.createElement('input');
        input.type = 'button';
        input.value = 'GRAPHSLIDE';
        input.onclick = showAlert;
        input.setAttribute(
            'style',
            'font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:55px;left:3px;'
        );
        document.body.appendChild(input);
        function showAlert() {
            addGraph();
        }
    }
}
var input = document.createElement('input');
input.type = 'button';
input.value = 'CELLMAPPER';
input.onclick = showCellM;
input.setAttribute(
    'style',
    'font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:32px;right:4px;'
);
document.body.appendChild(input);
function showCellM() {
    window.open(
        'https://www.cellmapper.net/map?MCC=' +
            plmnMC +
            '&MNC=' +
            plmnMN +
            '&=' +
            cell_id +
            '&zoom=15'
    );
}
var input = document.createElement('input');
input.type = 'button';
input.value = 'SPEEDTEST';
input.onclick = showSpeedTest;
input.setAttribute(
    'style',
    'font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:55px;right:4px;'
);
document.body.appendChild(input);
function showSpeedTest() {
    window.open('https://www.speedtest.net/');
}
