javascript: spreadName();
monitor = [1, 3, 5, 8, 20, 28, 38, 40, 41];
mainband = null;
_2ndrun = null;
suspend = 0;
function currentBand() {
  if (suspend == 1) return;
  console.log("Get Signal");
  const dhcpMaskElement = document.getElementById("dhcp_mask");
  if (dhcpMaskElement) {
    dhcpMaskElement.style.display = "block";
  }
  const dhcpDnsElement = document.getElementById("dhcp_dns");
  if (dhcpDnsElement) {
    dhcpDnsElement.style.display = "block";
  }
  function updateElements(vars, data) {
    vars.forEach((key) => {
      const val = extractXML(key, data);
      window[key] = val;
      const el = document.getElementById(key);
      if (el) el.innerHTML = val;
    });
  }
  function makeRequest(url, successCallback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        successCallback(xhr.responseText);
      } else {
        console.log(
          "Signal Error:" +
            xhr.status +
            "\n" +
            "message:" +
            xhr.responseText +
            "\n" +
            "error:" +
            xhr.statusText
        );
      }
    };
    xhr.onerror = function () {
      console.log(
        "Signal Error:" +
          xhr.status +
          "\n" +
          "message:" +
          xhr.responseText +
          "\n" +
          "error: Network Error"
      );
    };
    xhr.send();
  }
  makeRequest("/api/device/signal", function (data) {
    const vars = [
      "rssi",
      "rsrp",
      "rsrq",
      "sinr",
      "dlbandwidth",
      "ulbandwidth",
      "band",
      "cell_id",
      "pci",
      "nei_cellid",
      "plmn",
      "tac",
      "ulfrequency",
      "dlfrequency",
    ];
    updateElements(vars, data);
    const cellIdNum = Number(window.cell_id);
    let hex = cellIdNum.toString(16);
    let hex2 = hex.substring(0, hex.length - 2);
    const enbid = parseInt(hex2, 16).toString();
    document.getElementById("enbid").innerHTML = enbid;
    hex2 = hex.substring(5);
    const enbidS = parseInt(hex2, 16).toString();
    document.getElementById("enbidS").innerHTML = enbidS;
    window.plmnMC = window.plmn.slice(0, 3);
    window.plmnMN = window.plmn.slice(-2);
    setgraph("rsrp", window.rsrp, -130, -51);
    setgraphRsrq("rsrq", window.rsrq, -20, -2);
    setgraphSinr("sinr", window.sinr, -4, 30);
  });
  console.log("Get Net Mode");
  makeRequest("/api/net/net-mode", function (data) {
    const lteband = extractXML("LTEBand", data);
    document.getElementById("allowed").innerHTML = _4GType(lteband);
  });
  makeRequest("/api/net/current-plmn", function (data) {
    const vars = ["ShortName", "FullName", "Rat"];
    updateElements(vars, data);
  });
  makeRequest("/api/device/information", function (data) {
    const vars = ["DeviceName", "ProductFamily", "Classify", "spreadname_en"];
    updateElements(vars, data);
  });
  makeRequest("/api/monitoring/status", function (data) {
    const vars = [
      "ConnectionStatus",
      "WanIPAddress",
      "CurrentNetworkType",
      "CurrentNetworkTypeEx",
      "SignalIcon",
    ];
    updateElements(vars, data);
    setgraphSignal("SignalIcon", window.SignalIcon, 0, 5);
    let netTypeEx = "";
    if (window.CurrentNetworkTypeEx === "1011") {
      netTypeEx = "LTE CA(4G+)";
    } else if (window.CurrentNetworkTypeEx === "101") {
      netTypeEx = "LTE(4G)";
    }
    document.getElementById("netTypeEx").innerHTML = netTypeEx;
  });
}
function extractXML(tag, data) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");
    const elements = xmlDoc.getElementsByTagName(tag);
    return elements.length ? elements[0].textContent : "";
  } catch (err) {
    return err.message;
  }
}
function setgraph(p, val, min, max) {
  val = parseInt(val.replace(/\dBm/g, ""));
  let x = ((val - min) / (max - min)) * 100;
  let xs = x + "%";
  let element = document.getElementById(p + "b");
  if (!element) return;
  element.style.width = xs;
  element.innerHTML = "📶 " + p + " : " + window[p];
  if (x < 10) {
    element.style.backgroundColor = "rgba(255,0,0,0.8)";
    element.style.color = "white";
  } else if (x > 10 && x < 50) {
    element.style.backgroundColor = "rgba(255,50,0,0.8)";
    element.style.color = "white";
  } else if (x > 50 && x < 65) {
    element.style.backgroundColor = "rgba(50,50,0,0.8)";
    element.style.color = "white";
  } else if (x > 65 && x < 75) {
    element.style.backgroundColor = "rgba(50,100,0,0.8)";
    element.style.color = "white";
  } else if (x > 75 && x < 83) {
    element.style.backgroundColor = "rgba(0,200,0,0.8)";
    element.style.color = "black";
  } else {
    element.style.backgroundColor = "rgba(0,255,0,0.8)";
    element.style.color = "black";
  }
}
function setgraphRsrq(p, val, min, max) {
  val = parseInt(val.replace(/\dB/g, ""));
  let x = ((val - min) / (max - min)) * 100;
  let xs = x + "%";
  let element = document.getElementById(p + "b");
  if (!element) return;
  element.style.width = xs;
  element.innerHTML = "📶 " + p + " : " + window[p];
  if (x < 6) {
    element.style.backgroundColor = "rgba(255,0,0,0.8)";
    element.style.color = "white";
  } else if (x > 6 && x < 28) {
    element.style.backgroundColor = "rgba(255,50,0,0.8)";
    element.style.color = "white";
  } else if (x > 28 && x < 55) {
    element.style.backgroundColor = "rgba(50,50,0,0.8)";
    element.style.color = "white";
  } else if (x > 55 && x < 70) {
    element.style.backgroundColor = "rgba(50,100,0,0.8)";
    element.style.color = "white";
  } else if (x > 70 && x < 83) {
    element.style.backgroundColor = "rgba(0,200,0,0.8)";
    element.style.color = "black";
  } else {
    element.style.backgroundColor = "rgba(0,255,0,0.8)";
    element.style.color = "black";
  }
}
function setgraphSinr(p, val, min, max) {
  val = parseInt(val.replace(/\[>=]30/g, "30").replace(/\dB/g, ""));
  let x = ((val - min) / (max - min)) * 100;
  let xs = x + "%";
  let element = document.getElementById(p + "b");
  if (!element) return;
  element.style.width = xs;
  element.innerHTML = "📶 " + p + " : " + window[p];
  if (x < 11) {
    element.style.backgroundColor = "rgba(255,0,0,0.8)";
    element.style.color = "white";
  } else if (x > 11 && x < 40) {
    element.style.backgroundColor = "rgba(255,50,0,0.8)";
    element.style.color = "white";
  } else if (x > 40 && x < 55) {
    element.style.backgroundColor = "rgba(50,50,0,0.8)";
    element.style.color = "white";
  } else if (x > 55 && x < 70) {
    element.style.backgroundColor = "rgba(50,100,0,0.8)";
    element.style.color = "white";
  } else if (x > 70 && x < 82) {
    element.style.backgroundColor = "rgba(0,200,0,0.8)";
    element.style.color = "black";
  } else {
    element.style.backgroundColor = "rgba(0,255,0,0.8)";
    element.style.color = "black";
  }
}
function setgraphSignal(p, Sig, min, max) {
  let x = ((Sig - min) / (max - min)) * 100;
  let xs = x + "%";
  let element = document.getElementById(p + "b");
  if (!element) return;
  element.style.width = xs;
  element.innerHTML = "📶 " + p + " : " + window[p];
  if (x < 1) {
    element.style.backgroundColor = "rgba(255,50,0,0.8)";
    element.style.color = "white";
  } else if (x > 1 && x < 2) {
    element.style.backgroundColor = "rgba(50,50,0,0.8)";
    element.style.color = "white";
  } else if (x > 2 && x < 3) {
    element.style.backgroundColor = "rgba(50,100,0,0.8)";
    element.style.color = "white";
  } else if (x > 3 && x < 4) {
    element.style.backgroundColor = "rgba(0,200,0,0.8)";
    element.style.color = "black";
  } else {
    element.style.backgroundColor = "rgba(0,255,0,0.8)";
    element.style.color = "black";
  }
}
function _4GType(data) {
  if (data === "20800800C5") {
    return "AUTO";
  }
  let data_out = "";
  let parsedData = parseInt(data, 16);
  for (let x = 0; x < monitor.length; x++) {
    let band = monitor[x];
    let bitmask = Math.pow(2, band - 1);
    let t;

    if (bitmask < 0x100000000) {
      t = parsedData & bitmask;
    } else {
      t = (parsedData / 0x100000000) & (bitmask / 0x100000000);
    }
    if (t !== 0) {
      data_out += "B" + band + "+";
    }
  }
  return data_out.replace(/\++$/, "");
}
function ltebandselection(bs) {
  console.log("CALLED " + bs);
  if (mainband) mainband = null;
  let band;
  if (arguments.length === 0) {
    band = prompt(
      "Please input the desired LTE band number. If you want to use multiple LTE bands, enter multiple range numbers (example 1+3 or 3+28 or 28+41). If you want to use all supported bands, Enter 'AUTO'.",
      "AUTO"
    );
    if (band) band = band.toLowerCase();
    if (band === null || band === "") {
      return;
    }
  } else {
    band = arguments[0];
  }
  let bsArr = band.split("+");
  let ltesum = 0;
  if (band.toUpperCase() === "AUTO") {
    ltesum = "7FFFFFFFFFFFFFFF";
  } else {
    for (let i = 0; i < bsArr.length; i++) {
      if (bsArr[i].toLowerCase().indexOf("m") !== -1) {
        bsArr[i] = bsArr[i].replace("m", "");
        mainband = bsArr[i];
      }
      if (bsArr[i].toUpperCase() === "AUTO") {
        ltesum = "7FFFFFFFFFFFFFFF";
        break;
      } else {
        ltesum = ltesum + Math.pow(2, parseInt(bsArr[i]) - 1);
      }
    }
    ltesum = ltesum.toString(16);
  }
  if (mainband) {
    console.log("Set Main");
    _2ndrun = bsArr;
    ltebandselection(String(mainband));
    return;
  }
  suspend = 1;
  const xhr1 = new XMLHttpRequest();
  xhr1.open("GET", "/html/home.html", true);
  xhr1.onload = function () {
    if (xhr1.status === 200) {
      const data = xhr1.responseText.split('name="csrf_token" content="');
      const token = data[data.length - 1].split('"')[0];
      setTimeout(function () {
        const xhr2 = new XMLHttpRequest();
        xhr2.open("POST", "/api/net/net-mode", true);
        xhr2.setRequestHeader("Content-Type", "application/xml");
        xhr2.setRequestHeader("__RequestVerificationToken", token);
        const xmlData = `
                    <request>
                        <NetworkMode>03</NetworkMode>
                        <NetworkBand>3FFFFFFF</NetworkBand>
                        <LTEBand>${ltesum}</LTEBand>
                    </request>
                `;
        xhr2.onload = function () {
          if (xhr2.status === 200) {
            console.log("success netmode");
            document.getElementById("band").innerHTML =
              '<span style="color:indigo;">- OK -</span>';
            if (_2ndrun) {
              console.log("Wait 2s");
              setTimeout(function () {
                console.log("Launch Netmode");
                ltebandselection(_2ndrun.join("+"));
                _2ndrun = false;
              }, 2000);
            } else {
              suspend = 0;
            }
          } else {
            alert(
              "Net Mode Error:" +
                xhr2.status +
                "\n" +
                "message:" +
                xhr2.responseText
            );
          }
        };
        xhr2.onerror = function () {
          alert(
            "Net Mode Error:" +
              xhr2.status +
              "\n" +
              "message:" +
              xhr2.responseText
          );
        };
        xhr2.send(xmlData);
      }, 2000);
    }
  };
  xhr1.onerror = function () {
    alert("Token Error:" + xhr1.status + "\n" + "message:" + xhr1.responseText);
  };
  xhr1.send();
}
window.setInterval(currentBand, 2500);
function spreadName() {
  let style1 = document.createElement("style");
  style1.innerHTML =
    ".vall{font-size:1.2em;color:#04a;} .valll{font-size:1.2em;font-weight:bold;color:blue;}";
  document.head.appendChild(style1);
  let style2 = document.createElement("style");
  style2.innerHTML = ".val{color:red;}";
  document.head.appendChild(style2);
  let div1 = document.createElement("div");
  div1.style.width = "1300px";
  div1.style.padding = "4px 1px";
  div1.style.margin = "0 auto";
  div1.innerHTML = `
        <span style="font-size:1.2em;font-weight:600;color: #9d9dff;" id="netType"></span>&nbsp; 
        <div style="display:inline;"><span class="valll" id="FullName"> </span>&nbsp; 
        <div style="display:inline;margin-left:300px;font-size:1em;font-weight:600;color: #c2172d;">
            <span class="vall" id="spreadname_en"> </span>&nbsp;&nbsp;&nbsp; Model: 
            <span class="vall" id="ProductFamily"> </span> &nbsp;<span class="vall" id="DeviceName"> </span>&nbsp; 
        </div> 
    `;
  document.body.prepend(div1);
  let div2 = document.createElement("div");
  div2.style.width = "1300px";
  div2.style.padding = "4px";
  div2.style.margin = "0 auto";
  div2.style.left = "30px";
  div2.innerHTML = `
        <div style="display:inline;margin-left:60px;"> UL:<span class="val" id="ulfrequency">0</span>&nbsp;&nbsp; 
        DL:<span class="val" id="dlfrequency">0</span>&nbsp;&nbsp; 
        <div style="display:inline;margin-left:400px;"> 
            RSRP:<span class="val" id="rsrp">0</span>&nbsp;&nbsp; 
            RSSI:<span class="val" id="rssi">0</span>&nbsp;&nbsp; 
            RSRQ:<span class="val" id="rsrq">0</span>&nbsp;&nbsp; 
            SINR:<span class="val" id="sinr">0</span>&nbsp;&nbsp; 
        </div> 
        </div>
    `;
  document.body.prepend(div2);
  let div3 = document.createElement("div");
  div3.style.width = "1300px";
  div3.style.padding = "4px";
  div3.style.margin = "0 auto";
  div3.style.left = "30px";
  div3.innerHTML = `
        <div style="display:inline;margin-left:60px;"> 
            <span id="netTypeEx"></span> B<span class="val" id="band">0</span>(
            <span class="val" id="dlbandwidth">0</span>/<span class="val" id="ulbandwidth">0</span>)&nbsp; 
            SET:<span class="val" id="allowed">0</span>&nbsp;&nbsp; 
            <div style="display:inline;margin-left:50px;"> 
                PLMN:<span class="val" id="plmn"> </span>&nbsp;&nbsp; 
                TAC:<span class="val" id="tac"> </span>&nbsp;&nbsp; 
                CELL ID:<span class="val" id="cell_id">0</span> &nbsp;&nbsp;  
                ENB ID:<span class="val" id="enbid">0</span>&nbsp;&nbsp; 
                Sec ID:<span class="val" id="enbidS">0</span> &nbsp;&nbsp; 
                PCI:<span class="val" id="pci">0</span>&nbsp;&nbsp;&nbsp; 
                NearbyPCI:<span class="val" id="nei_cellid">0</span>&nbsp;&nbsp;&nbsp; 
            </div> 
        </div>
    `;
  document.body.prepend(div3);
  let button1 = document.createElement("input");
  button1.type = "button";
  button1.value = "BAND FREQUENCY";
  button1.onclick = showBANDS;
  button1.setAttribute(
    "style",
    "font-size:100%;font-weight:bold;margin-right:30px;color:#04a;text-decoration:underline;position:absolute;top:32px;left:3px;"
  );
  document.body.appendChild(button1);
  function showBANDS() {
    ltebandselection();
  }
  function addGraph() {
    const headContainer = document.querySelector(".headcontainer");
    if (headContainer) {
      headContainer.style.display = "none";
    }
    let divGraph = document.createElement("div");
    divGraph.style.width = "1300px";
    divGraph.style.position = "absolute";
    divGraph.style.top = "156px";
    divGraph.style.paddingLeft = "10px";
    divGraph.innerHTML = `
            <style> 
                .p{border:10px;width:auto;padding-top:3px;height:30px;} 
                .ps{border:1px;padding-top:2px;width:auto;height:13px;} 
                .v{border-radius: 5px 25px 25px 5px;font-size:150%;height:30px;}
                .vs{border-radius: 5px 25px 25px 5px;font-size:75%;height:13px;} 
            </style> 
            <div class="ps"><div class="vs" id="SignalIconb"></div></div> 
            <div class="p"><div class="v" id="rsrpb"></div></div> 
            <div class="p"><div class="v" id="rsrqb"></div></div> 
            <div class="p"><div class="v" id="sinrb"></div></div>
        `;
    document.body.prepend(divGraph);
    let button2 = document.createElement("input");
    button2.type = "button";
    button2.value = "⫷RELOAD PAGE⫸";
    button2.onclick = showReload;
    button2.setAttribute(
      "style",
      "font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:55px;left:3px;"
    );
    document.body.appendChild(button2);
    function showReload() {
      window.location.reload();
    }
  }
  let button3 = document.createElement("input");
  button3.type = "button";
  button3.value = "GRAPHSLIDE";
  button3.onclick = showAlert;
  button3.setAttribute(
    "style",
    "font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:55px;left:3px;"
  );
  document.body.appendChild(button3);
  function showAlert() {
    addGraph();
  }
}
var cellMapperButton = document.createElement("input");
cellMapperButton.type = "button";
cellMapperButton.value = "CELLMAPPER";
cellMapperButton.onclick = showCellM;
cellMapperButton.setAttribute(
  "style",
  "font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:32px;right:4px;"
);
document.body.appendChild(cellMapperButton);
function showCellM() {
  var plmnMC = "YourMCC";
  var plmnMN = "YourMNC";
  var cell_id = "YourCellID";
  window.open(
    "https://www.cellmapper.net/map?MCC=" +
      plmnMC +
      "&MNC=" +
      plmnMN +
      "&cellid=" +
      cell_id +
      "&zoom=15"
  );
}
var speedTestButton = document.createElement("input");
speedTestButton.type = "button";
speedTestButton.value = "SPEEDTEST";
speedTestButton.onclick = showSpeedTest;
speedTestButton.setAttribute(
  "style",
  "font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:55px;right:4px;"
);
document.body.appendChild(speedTestButton);
function showSpeedTest() {
  window.open("https://www.speedtest.net/");
}
