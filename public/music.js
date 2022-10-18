var aud=new Audio();
var songs=["ko57ZQBHoZc", "Xu9-wTD0u8o"];
var insturl="https://invidious.zapashcanon.fr";
var loading=false;
var usealt=0;

function shuffle(array) {
  for (let i = 0; i < array.length; i++) {
    let j = Math.floor(Math.random() * (array.length-i)) + i;
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function fixfard(url){
  if(!url)return insturl;
  return url.endsWith("/")?url.slice(0,url.length-1):url;
}

var updinsturl=async ()=>{
  try{
  var json=await (await fetch("https://api.invidious.io/instances.json?sort_by=health")).json();
  var out=shuffle(json).map(entry => {
    const healthKnown = !!entry[1].monitor
    return {
      name: entry[0],
      details: entry[1],
      health: +(healthKnown ? entry[1].monitor.dailyRatios[0].ratio : 95),
      healthKnown
    }
  }).filter(entry => {
    return entry.details.type === "https" && entry.health > 0
  }).sort((a, b) => {
    return b.health - a.health
  });
  insturl=fixfard(out.find(e=>e.details.cors).details.uri);
  }catch(e){aud.onerror();}
};
var updint=setInterval(updinsturl,3600000);
updinsturl();

aud.onended=function(e){
	loading=true;
	window.startmusic();
};

aud.oncanplay=function(e){
	aud.play();
};

aud.onplay=function(e){
	aud.playing=true;
	loading=false;
};

aud.onerror=function(e){
	if(usealt==2){
		aud=null;
		return;
	}

	if(usealt==0){
		usealt=1;
	}else if(usealt==1){
		loading=true;
		usealt=2;
	}
	window.stopmusic();
	//todo: make attempt 2 more times with diff urls and if those fail then stop trying
	clearInterval(updint);
};

window.startmusic=function(v){
	if(v!=null&&v==0)return;
	loading=true;
	var url="";
	if(usealt==0){
		songs=shuffle(songs);
		url=insturl+"/latest_version?id="+songs[0]+"&itag=251";
	}else if(usealt==1){
		url="https://file-examples.com/storage/fe150d1a0362796aca560c6/2017/11/file_example_MP3_5MG.mp3";
	}else if(usealt==2){
		return;
	}
	if(v!=null)aud.volume=v;
	aud.src=url;
	aud.currentTime=0;
};

window.stopmusic=function(){
	if(usealt==2)return;
	aud.pause();
	loading=false;
};

window.volmusic=function(v){
	if(usealt==2)return;
	if(v==0){
		window.startmusic();
	}else{
		if(aud.playing){
			aud.volume=v;
		}else{
			window.startmusic(v);
		}
	}
};

window.playingmusic=function(){
	return usealt==2||aud.playing||loading;
};

navigator.mediaSession.setActionHandler('play', function() {});
navigator.mediaSession.setActionHandler('pause', function() {});
navigator.mediaSession.setActionHandler('seekbackward', function() {});
navigator.mediaSession.setActionHandler('seekforward', function() {});
navigator.mediaSession.setActionHandler('previoustrack', function() {});
navigator.mediaSession.setActionHandler('nexttrack', function() {});
