javascript: spreadName();
const monitor = [1, 3, 5, 8, 20, 28, 38, 40, 41];
let mainband = null;
let _2ndrun = null;
let suspend = 0;

async function currentBand() {
  if (suspend === 1) return;
  console.log("Get Signal");
  document.getElementById("dhcp_mask").style.display = "block";
  document.getElementById("dhcp_dns").style.display = "block";

  try {
    const signalResponse = await fetch("/api/device/signal");
    const signalData = await signalResponse.text();
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
    vars.forEach((varName) => {
      window[varName] = extractXML(varName, signalData);
      document.getElementById(varName).innerHTML = window[varName];
    });

    let hex = Number(cell_id).toString(16);
    let hex2 = hex.substring(0, hex.length - 2);
    let enbid = parseInt(hex2, 16).toString();
    document.getElementById("enbid").innerHTML = enbid;

    hex = Number(cell_id).toString(16);
    hex2 = hex.substring(5, hex.length);
    let enbidS = parseInt(hex2, 16).toString();
    document.getElementById("enbidS").innerHTML = enbidS;

    let plmnMC = plmn.slice(0, 3);
    let plmnMN = plmn.slice(-2);

    setgraph("rsrp", rsrp, -130, -51);
    setgraphRsrq("rsrq", rsrq, -20, -2);
    setgraphSinr("sinr", sinr, -4, 30);
  } catch (error) {
    alert(`Signal Error: ${error.message}`);
  }

  console.log("Get Net Mode");
  try {
    const netModeResponse = await fetch("/api/net/net-mode");
    const netModeData = await netModeResponse.text();
    const lteband = extractXML("LTEBand", netModeData);
    document.getElementById("allowed").innerHTML = _4GType(lteband);
  } catch (error) {
    alert(`Signal Error: ${error.message}`);
  }

  try {
    const currentPlmnResponse = await fetch("/api/net/current-plmn");
    const currentPlmnData = await currentPlmnResponse.text();
    const vars = ["ShortName", "FullName", "Rat"];
    vars.forEach((varName) => {
      window[varName] = extractXML(varName, currentPlmnData);
      document.getElementById(varName).innerHTML = window[varName];
    });
  } catch (error) {
    alert(`Signal Error: ${error.message}`);
  }

  try {
    const deviceInfoResponse = await fetch("/api/device/information");
    const deviceInfoData = await deviceInfoResponse.text();
    const vars = ["DeviceName", "ProductFamily", "Classify", "spreadname_en"];
    vars.forEach((varName) => {
      window[varName] = extractXML(varName, deviceInfoData);
      document.getElementById(varName).innerHTML = window[varName];
    });
  } catch (error) {
    alert(`Signal Error: ${error.message}`);
  }

  try {
    const monitoringStatusResponse = await fetch("/api/monitoring/status");
    const monitoringStatusData = await monitoringStatusResponse.text();
    const vars = [
      "ConnectionStatus",
      "WanIPAddress",
      "CurrentNetworkType",
      "CurrentNetworkTypeEx",
      "SignalIcon",
    ];
    vars.forEach((varName) => {
      window[varName] = extractXML(varName, monitoringStatusData);
      document.getElementById(varName).innerHTML = window[varName];
    });
    setgraphSignal("SignalIcon", SignalIcon, 0, 5);

    let netTypeEx = "";
    if (CurrentNetworkTypeEx === "1011") {
      netTypeEx = "LTE CA(4G+)";
    } else if (CurrentNetworkTypeEx === "101") {
      netTypeEx = "LTE(4G)";
    }
    document.getElementById("netTypeEx").innerHTML = netTypeEx;
  } catch (error) {
    alert(`Signal Error: ${error.message}`);
  }
}
function extractXML(tag, data) {
  try {
    return data.split("</" + tag + ">")[0].split("<" + tag + ">")[1];
  } catch (err) {
    return err.message;
  }
}
function setgraph(p, val, min, max) {
  val = parseInt(val.replace(/\dBm/g, ""));
  const x = ((val - min) / (max - min)) * 100;
  const xs = `${x}%`;
  const e = document.getElementById(`${p}b`);

  if (!e) return;

  e.style.width = xs;
  e.innerHTML = `📶 ${p} : ${window[p]}`;

  if (x < 10) {
    e.style.backgroundColor = "rgba(255,0,0,0.8)";
    e.style.color = "white";
  } else if (x > 10 && x < 50) {
    e.style.backgroundColor = "rgba(255,50,0,0.8)";
    e.style.color = "white";
  } else if (x > 50 && x < 65) {
    e.style.backgroundColor = "rgba(50,50,0,0.8)";
    e.style.color = "white";
  } else if (x > 65 && x < 75) {
    e.style.backgroundColor = "rgba(50,100,0,0.8)";
    e.style.color = "white";
  } else if (x > 75 && x < 83) {
    e.style.backgroundColor = "rgba(0,200,0,0.8)";
    e.style.color = "black";
  } else {
    e.style.backgroundColor = "rgba(0,255,0,0.8)";
    e.style.color = "black";
  }
}
function setgraphRsrq(p, val, min, max) {
  val = parseInt(val.replace(/\dB/g, ""));
  let x = ((val - min) / (max - min)) * 100;
  let xs = String(x) + "%";
  let e = document.querySelector("#" + p + "b");

  if (!e) return; // Ensure element exists

  e.style.width = xs;
  e.textContent = "📶 " + p + " : " + window[p];

  if (x < 6) {
    e.style.backgroundColor = "rgba(255,0,0,0.8)";
    e.style.color = "white";
  } else if (x > 6 && x < 28) {
    e.style.backgroundColor = "rgba(255,50,0,0.8)";
    e.style.color = "white";
  } else if (x > 28 && x < 55) {
    e.style.backgroundColor = "rgba(50,50,0,0.8)";
    e.style.color = "white";
  } else if (x > 55 && x < 70) {
    e.style.backgroundColor = "rgba(50,100,0,0.8)";
    e.style.color = "white";
  } else if (x > 70 && x < 83) {
    e.style.backgroundColor = "rgba(0,200,0,0.8)";
    e.style.color = "black";
  } else {
    e.style.backgroundColor = "rgba(0,255,0,0.8)";
    e.style.color = "black";
  }
}

function setgraphSinr(p, val, min, max) {
  val = parseInt(val.replace(/\[>=]30/g, "30").replace(/\dB/g, ""));
  let x = ((val - min) / (max - min)) * 100;
  let xs = String(x) + "%";
  let e = document.getElementById(p + "b");

  if (e) {
    e.style.width = xs;
    e.innerHTML = "📶 " + p + " : " + window[p];

    if (x < 11) {
      e.style.backgroundColor = "rgba(255,0,0,0.8)";
      e.style.color = "white";
    } else if (x > 11 && x < 40) {
      e.style.backgroundColor = "rgba(255,50,0,0.8)";
      e.style.color = "white";
    } else if (x > 40 && x < 55) {
      e.style.backgroundColor = "rgba(50,50,0,0.8)";
      e.style.color = "white";
    } else if (x > 55 && x < 70) {
      e.style.backgroundColor = "rgba(50,100,0,0.8)";
      e.style.color = "white";
    } else if (x > 70 && x < 82) {
      e.style.backgroundColor = "rgba(0,200,0,0.8)";
      e.style.color = "black";
    } else {
      e.style.backgroundColor = "rgba(0,255,0,0.8)";
      e.style.color = "black";
    }
  }
}

function setgraphSignal(p, Sig, min, max) {
  const x = ((Sig - min) / (max - min)) * 100;
  const xs = `${x}%`;
  const e = document.querySelector(`#${p}b`);

  if (!e) return; // Guard in case the element doesn't exist

  e.style.width = xs;
  e.textContent = `📶 ${p} : ${window[p]}`;

  if (x < 1) {
    e.style.backgroundColor = "rgba(255,50,0,0.8)";
    e.style.color = "white";
  } else if (x > 1 && x < 2) {
    e.style.backgroundColor = "rgba(50,50,0,0.8)";
    e.style.color = "white";
  } else if (x > 2 && x < 3) {
    e.style.backgroundColor = "rgba(50,100,0,0.8)";
    e.style.color = "white";
  } else if (x > 3 && x < 4) {
    e.style.backgroundColor = "rgba(0,200,0,0.8)";
    e.style.color = "black";
  } else {
    e.style.backgroundColor = "rgba(0,255,0,0.8)";
    e.style.color = "black";
  }
}

function _4GType(data) {
  {
    if (data == "20800800C5") {
      return "AUTO";
    }
    data_out = "";
    for (x = 0; x < monitor.length; x++) {
      tb = Math.pow(2, monitor[x] - 1);
      var t;
      if (tb < 0x100000000) {
        t = parseInt(data, 16) & tb;
      } else {
        t = (parseInt(data, 16) / 0x100000000) & (tb / 0x100000000);
      }
      if (t != 0) {
        data_out += "B" + String(monitor[x]) + "+";
      }
    }
    data_out = data_out.replace(/\++$/, "");
    return data_out;
  }
}

async function ltebandselection(bs) {
  console.log("CALLED" + bs);
  if (typeof mainband !== "undefined" && mainband) mainband = null;

  let band;
  if (arguments.length === 0) {
    band = prompt(
      "Please input the desired LTE band number. If you want to use multiple LTE bands, enter multiple range numbers (example 1+3 or 3+28 or 28+41). If you want to use all supported bands, Enter 'AUTO'.",
      "AUTO"
    );
    if (band) band = band.toLowerCase();
    if (band == null || band === "") return;
  } else {
    band = arguments[0];
  }

  let bsArr = band.split("+");
  let ltesum = 0;

  if (band.toUpperCase() === "AUTO") {
    ltesum = "7FFFFFFFFFFFFFFF";
  } else {
    for (let i = 0; i < bsArr.length; i++) {
      if (bsArr[i].toLowerCase().includes("m")) {
        bsArr[i] = bsArr[i].replace("m", "");
        mainband = bsArr[i];
      }

      if (bsArr[i].toUpperCase() === "AUTO") {
        ltesum = "7FFFFFFFFFFFFFFF";
        break;
      } else {
        ltesum += Math.pow(2, parseInt(bsArr[i]) - 1);
      }
    }
    ltesum = ltesum.toString(16);
  }

  if (typeof mainband !== "undefined" && mainband) {
    console.log("Set Main");
    _2ndrun = bsArr;
    ltebandselection(String(mainband));
    return;
  }

  suspend = 1;

  try {
    const getResponse = await fetch("/html/home.html");
    if (!getResponse.ok) {
      throw new Error(`Token Error: ${getResponse.status}`);
    }

    const data = await getResponse.text();
    const datas = data.split('name="csrf_token" content="');
    const token = datas[datas.length - 1].split('"')[0];

    setTimeout(async () => {
      try {
        const postResponse = await fetch("/api/net/net-mode", {
          method: "POST",
          headers: {
            "Content-Type": "application/xml",
            __RequestVerificationToken: token,
          },
          body: `<request><NetworkMode>03</NetworkMode><NetworkBand>3FFFFFFF</NetworkBand><LTEBand>${ltesum}</LTEBand></request>`,
        });

        if (!postResponse.ok) {
          const errorText = await postResponse.text();
          throw new Error(
            `Net Mode Error: ${postResponse.status}\nmessage: ${errorText}`
          );
        }

        console.log("success netmode");
        document.getElementById("band").innerHTML =
          '<span style="color:indigo;">- OK -</span>';

        if (_2ndrun) {
          console.log("Wait 2s");
          setTimeout(() => {
            console.log("Launch Netmode");
            ltebandselection(_2ndrun.join("+"));
            _2ndrun = false;
          }, 2000);
        } else {
          suspend = 0;
        }
      } catch (err) {
        alert(err.message);
      }
    }, 2000);
  } catch (err) {
    alert(err.message);
  }
}

window.setInterval(currentBand, 2500);

function spreadName() {
  // Add styles and first section to the <html> element
  const style1 = document.createElement("style");
  style1.textContent = `
        .vall { font-size:1.2em; color:#04a; }
        .valll { font-size:1.2em; font-weight:bold; color:blue; }
    `;
  document.documentElement.prepend(style1);

  const firstDiv = document.createElement("div");
  firstDiv.style.cssText = "width:1300px;padding:4px 1px;margin:0 auto;";
  firstDiv.innerHTML = `
        <span style="font-size:1.2em;font-weight:600;color: #9d9dff;" id="netType"></span>&nbsp;
        <div style="display:inline;">
            <span class="valll" id="FullName"></span>&nbsp;
            <div style="display:inline;margin-left:300px;font-size:1em;font-weight:600;color: #c2172d;">
                <span class="vall" id="spreadname_en"></span>&nbsp;&nbsp;&nbsp; 
                Model: <span class="vall" id="ProductFamily"></span> &nbsp;
                <span class="vall" id="DeviceName"></span>&nbsp;
            </div>
        </div>
    `;
  document.body.prepend(firstDiv);

  // Second section
  const style2 = document.createElement("style");
  style2.textContent = `.val { color:red; }`;
  document.body.prepend(style2);

  const secondDiv = document.createElement("div");
  secondDiv.style.cssText = "width:1300px;padding:4px;margin:0 auto;left:30;";
  secondDiv.innerHTML = `
        <div style="display:inline;margin-left:60px;">
            UL:<span class="val" id="ulfrequency">0</span>&nbsp;&nbsp;
            DL:<span class="val" id="dlfrequency">0</span>&nbsp;&nbsp;
            <div style="display:inline;margin-left:400px;">
                RSRP:<span class="val" id="rsrp">0</span>&nbsp;&nbsp;
                RSSI:<span class="val" id="rssi">0</span>&nbsp;&nbsp;
                RSRQ:<span class="val" id="rsrq">0</span>&nbsp;&nbsp;
                SINR:<span class="val" id="sinr">0</span>&nbsp;&nbsp;
            </div>
        </div>
    `;
  document.body.prepend(secondDiv);

  // Third section
  const thirdDiv = document.createElement("div");
  thirdDiv.style.cssText = "width:1300px;padding:4px;margin:0 auto;left:30;";
  thirdDiv.innerHTML = `
        <div style="display:inline;margin-left:60px;">
            <span id="netTypeEx"></span>
            B<span class="val" id="band">0</span>(
                <span class="val" id="dlbandwidth">0</span>/
                <span class="val" id="ulbandwidth">0</span>
            )&nbsp; SET:<span class="val" id="allowed">0</span>&nbsp;&nbsp;
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
  document.body.prepend(thirdDiv);

  // BAND FREQUENCY Button
  const bandButton = document.createElement("input");
  bandButton.type = "button";
  bandButton.value = "BAND FREQUENCY";
  bandButton.style.cssText =
    "font-size:100%;font-weight:bold;margin-right:30px;color:#04a;text-decoration:underline;position:absolute;top:32px;left:3px;";
  bandButton.onclick = () => ltebandselection();
  document.body.appendChild(bandButton);

  // GRAPHSLIDE Button
  const graphButton = document.createElement("input");
  graphButton.type = "button";
  graphButton.value = "GRAPHSLIDE";
  graphButton.style.cssText =
    "font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:55px;left:3px;";
  graphButton.onclick = addGraph;
  document.body.appendChild(graphButton);

  // addGraph function
  function addGraph() {
    const headContainer = document.querySelector(".headcontainer");
    if (headContainer) headContainer.style.display = "none";

    const graphContainer = document.createElement("div");
    graphContainer.style.cssText =
      "width:1300px;position:absolute;top:156px;padding-left:10px;";
    graphContainer.innerHTML = `
            <style>
                .p { border:10px;width:auto;padding-top:3px;height:30px; }
                .ps { border:1px;padding-top:2px;width:auto;height:13px; }
                .v { border-radius: 5px 25px 25px 5px;font-size:150%;height:30px; }
                .vs { border-radius: 5px 25px 25px 5px;font-size:75%;height:13px; }
            </style>
            <div class="ps"><div class="vs" id="SignalIconb"></div></div>
            <div class="p"><div class="v" id="rsrpb"></div></div>
            <div class="p"><div class="v" id="rsrqb"></div></div>
            <div class="p"><div class="v" id="sinrb"></div></div>
        `;
    document.body.prepend(graphContainer);

    const reloadButton = document.createElement("input");
    reloadButton.type = "button";
    reloadButton.value = "⫷RELOAD PAGE⫸";
    reloadButton.style.cssText =
      "font-size:100%;font-weight:bold;color:#04a;text-decoration:underline;position:absolute;top:55px;left:3px;";
    reloadButton.onclick = () => window.location.reload();
    document.body.appendChild(reloadButton);
  }
}

const createButton = (text, onClick, topPosition) => {
  const button = document.createElement("input");
  button.type = "button";
  button.value = text;
  button.onclick = onClick;
  Object.assign(button.style, {
    fontSize: "100%",
    fontWeight: "bold",
    color: "#04a",
    textDecoration: "underline",
    position: "absolute",
    top: `${topPosition}px`,
    right: "4px",
  });
  document.body.appendChild(button);
};

const showCellM = () => {
  const url = `https://www.cellmapper.net/map?MCC=${plmnMC}&MNC=${plmnMN}&=${cell_id}&zoom=15`;
  window.open(url);
};

const showSpeedTest = () => {
  window.open("https://www.speedtest.net/");
};

// Create the buttons
createButton("CELLMAPPER", showCellM, 32);
createButton("SPEEDTEST", showSpeedTest, 55);
