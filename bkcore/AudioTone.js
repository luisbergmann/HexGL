var bkcore = bkcore || {};

bkcore.AudioTone = {};

bkcore.AudioTone.initTone = function() {
  Tone.context.latencyHint = 'fastest';
  Tone.Transport.bpm.value = 126;
  Tone.Transport.start();

  bkcore.AudioTone.countdown = function() {
    bkcore.AudioTone.countdown_reverb = new Tone.Freeverb({
      wet: 0.2,
      roomSize: 0.9
    });
    bkcore.AudioTone.countdown_distortion = new Tone.Distortion(0.5);
    bkcore.AudioTone.countdown_filter = new Tone.Filter(80, 'highpass');
    bkcore.AudioTone.countdownSynth = new Tone.Synth({
      volume: -29,
      oscillator: {
        type: 'pwm'
      },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 1,
        release: 0.5
      }
    }).chain(bkcore.AudioTone.countdown_filter, bkcore.AudioTone.countdown_distortion,
      bkcore.AudioTone.countdown_reverb, Tone.Master);
    // bkcore.AudioTone.countdownSynth.volume.value = -24;

    bkcore.AudioTone.countdown.play = function(note) {
      bkcore.AudioTone.countdownSynth.triggerAttackRelease(note, '4n');
    }

    var alarmPlaying = false;
    bkcore.AudioTone.playAlarm = function() {
      if (!alarmPlaying) {
        bkcore.AudioTone.alarmLooper = new Tone.Part(function(time) {
          alarmPlaying = true;
          bkcore.AudioTone.countdown_filter.frequency = 1000;
          bkcore.AudioTone.countdownSynth.triggerAttackRelease('C2', '2n');
        }, [0]).start()
        bkcore.AudioTone.alarmLooper.loop = true;
        bkcore.AudioTone.alarmLooper.loopEnd = '2m';

      }
    }

  }

  bkcore.AudioTone.countdown();


  bkcore.AudioTone.clickMenu = new Tone.Player('audio/clickMenu.ogg', clickMenuLoaded).toMaster();
  bkcore.AudioTone.crashPlayerFilter = new Tone.Filter(1000)
  bkcore.AudioTone.crashPlayer = new Tone.Player('audio/crash.ogg', crashLoaded).
  chain(bkcore.AudioTone.crashPlayerFilter, Tone.Master);


  function crashLoaded() {
    // console.log('crash loaded');
    bkcore.AudioTone._crashLoaded = true;
  }


  function clickMenuLoaded() {
    // console.log('clickMenu loaded');
    bkcore.AudioTone._clickMenuLoaded = true;
  }


  // Pad Synth
  bkcore.AudioTone.padSynth = new Tone.PolySynth(4, Tone.FMSynth);
  bkcore.AudioTone.padFilter = new Tone.Filter(200, 'highpass');
  bkcore.AudioTone.padFilter2 = new Tone.Filter(1000);
  bkcore.AudioTone.padTremolo = new Tone.Tremolo('6n', 1).start();
  bkcore.AudioTone.padDist = new Tone.Distortion({
    distortion: 0.9,
    wet: 0.4
  });
  bkcore.AudioTone.padSynth.chain(bkcore.AudioTone.padDist,
    bkcore.AudioTone.padTremolo, bkcore.AudioTone.padFilter, bkcore.AudioTone.padFilter2,
    Tone.Master);
  bkcore.AudioTone.padSynth.set({
    volume: -12,
    detune: 0,
    harmonicity: 3,
    modulationIndex: 5,
    detune: 0,
    oscillator: {
      type: 'amsine'
    },
    envelope: {
      attack: 5,
      decay: 1,
      sustain: 1,
      release: 15
    },
    modulation: {
      type: 'fatsine',
      partials: 2,
    },
    modulationEnvelope: {
      attack: 0.5,
      decay: 0,
      sustain: 1,
      release: 2
    }
  })

  // Pad Part
  MidiConvert.load('audio/pad_01.mid', function(midi) {
    bkcore.AudioTone.padPart = new Tone.Part(function(time, note) {
      bkcore.AudioTone.padSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity)
    }, midi.tracks[1].notes).start();
    bkcore.AudioTone.padPart.loopEnd = '28m';
    bkcore.AudioTone.padPart.loop = true;
  })

  var padTremoloRate = ['4n', '6n', '8n', '12n', '16n'];
  bkcore.AudioTone.padTremoloSort = new Tone.Loop(function(time) {
    var rateIndex = Math.random() * 4 | 0;
    bkcore.AudioTone.padTremolo.set('frequency', padTremoloRate[rateIndex])
  }, '1m').start();


  bkcore.AudioTone.noiseMenu = new Tone.NoiseSynth({
    volume: -43,
    type: 'brown',
    envelope: {
      attack: 0.3,
      decay: 0.0001,
      sustain: 0.0001,
      release: 0.1
    }
  }).toMaster();


  bkcore.AudioTone.menuSynthChorus = new Tone.Chorus();
  bkcore.AudioTone.menuSynth = new Tone.MetalSynth({
    volume: -6,
    frequency: 50,
    envelope: {
      attack: 0.0001,
      decay: 0.0001,
      release: 2
    },
    harmonicity: 1.5,
    modulationIndex: 400,
    resonance: 7600,
    octaves: 0.6
  }).chain(bkcore.AudioTone.menuSynthChorus, Tone.Master);


}

bkcore.AudioTone.stopPad = function() {
  bkcore.AudioTone.padSynth.volume.linearRampTo(-99, 5);
  bkcore.AudioTone.padPart.stop('+5');
  bkcore.AudioTone.noiseMenu.dispose();
  bkcore.AudioTone.menuSynth.dispose();
  Tone.Transport.schedule(function (time) {
    bkcore.AudioTone.padSynth.dispose();
  }, '+6');

  bkcore.AudioTone.initSoundtrack();
}

bkcore.AudioTone.playClick = function() {
  bkcore.AudioTone.menuSynth.triggerAttack();
}

/*
███    ███ ██    ██ ███████ ██  ██████ ████████ ██████   █████   ██████ ██   ██
████  ████ ██    ██ ██      ██ ██         ██    ██   ██ ██   ██ ██      ██  ██
██ ████ ██ ██    ██ ███████ ██ ██         ██    ██████  ███████ ██      █████
██  ██  ██ ██    ██      ██ ██ ██         ██    ██   ██ ██   ██ ██      ██  ██
██      ██  ██████  ███████ ██  ██████    ██    ██   ██ ██   ██  ██████ ██   ██
*/


bkcore.AudioTone.initSoundtrack = function() {

  bkcore.AudioTone.loops = [];
  var index = 0;
  bkcore.AudioTone.indexOld = 0;

  bkcore.AudioTone.loop1_filter = new Tone.Filter(80);
  bkcore.AudioTone.loop1 = new Tone.Player('audio/loop_01.ogg', loop_01_loaded).
  chain(bkcore.AudioTone.loop1_filter, Tone.Master);
  bkcore.AudioTone.loop1.volume.value = -3;
  bkcore.AudioTone.loop1.loop = true;


  // loop change Part
  bkcore.AudioTone.looper = new Tone.Loop(function(time) {
    console.log(Tone.Transport.position);
    console.log('indexOld: ' + bkcore.AudioTone.indexOld);
    console.log('index: ' + index);
    if (index == 3) {
      bkcore.AudioTone.looper.interval = '16m';
    } else if (index == 6) {
      bkcore.AudioTone.looper.interval = '32m';
    } else {
      bkcore.AudioTone.looper.interval = '4m';
    }
    if (bkcore.AudioTone.loops[bkcore.AudioTone.indexOld]) bkcore.AudioTone.loops[bkcore.AudioTone.indexOld].stop();
    if (bkcore.AudioTone.loops[index]) bkcore.AudioTone.loops[index].start();
    if (index == 0) bkcore.AudioTone.loop1_filter.frequency.linearRampTo(5000, 10);
    bkcore.AudioTone.indexOld = index;
    if (index < 7) {
      index++;
    } else {
      index = 1;
    }
  }, '4m'); //check for loop changes on every 4 bars
  bkcore.AudioTone.looper.loop = true;


  function loop_01_loaded() {
    console.log('loop_01_loaded');
    bkcore.AudioTone.loops.push(bkcore.AudioTone.loop1);
    var index = 0
    bkcore.AudioTone.looper.start();

    bkcore.AudioTone.loop2 = new Tone.Player('audio/loop_02.ogg', loop_02_loaded).
    chain(Tone.Master);
    // bkcore.AudioTone.loop2.volume.value = -3;
    bkcore.AudioTone.loop2.loop = true;
  }

  function loop_02_loaded() {
    console.log('loop_02_loaded');
    bkcore.AudioTone.loops.push(bkcore.AudioTone.loop2);
    bkcore.AudioTone.loop3 = new Tone.Player('audio/loop_03.ogg', loop_03_loaded).
    chain(Tone.Master);
    // bkcore.AudioTone.loop3.volume.value = -3;
    bkcore.AudioTone.loop3.loop = true;
  }

  function loop_03_loaded() {
    console.log('loop_03_loaded');
    bkcore.AudioTone.loops.push(bkcore.AudioTone.loop3);
    bkcore.AudioTone.loop4 = new Tone.Player('audio/loop_04.ogg', loop_04_loaded).
    chain(Tone.Master);
    // bkcore.AudioTone.loop4.volume.value = -3;
    bkcore.AudioTone.loop4.loop = true;
  }

  function loop_04_loaded() {
    console.log('loop_04_loaded');
    bkcore.AudioTone.loops.push(bkcore.AudioTone.loop4);
    bkcore.AudioTone.loop5 = new Tone.Player('audio/loop_05.ogg', loop_05_loaded).
    chain(Tone.Master);
    // bkcore.AudioTone.loop5.volume.value = -3;
    bkcore.AudioTone.loop5.loop = true;
  }

  function loop_05_loaded() {
    console.log('loop_05_loaded');
    bkcore.AudioTone.loops.push(bkcore.AudioTone.loop5);
    bkcore.AudioTone.loop6 = new Tone.Player('audio/loop_06.ogg', loop_06_loaded).
    chain(Tone.Master);
    // bkcore.AudioTone.loop6.volume.value = -3;
    bkcore.AudioTone.loop6.loop = true;
  }

  function loop_06_loaded() {
    console.log('loop_06_loaded');
    bkcore.AudioTone.loops.push(bkcore.AudioTone.loop6);
    bkcore.AudioTone.loop7 = new Tone.Player('audio/loop_07.ogg', loop_07_loaded).
    chain(Tone.Master);
    // bkcore.AudioTone.loop7.volume.value = -3;
    bkcore.AudioTone.loop7.loop = true;
  }

  function loop_07_loaded() {
    console.log('loop_07_loaded');
    bkcore.AudioTone.loops.push(bkcore.AudioTone.loop7);
    bkcore.AudioTone.loop8 = new Tone.Player('audio/loop_08.ogg', loop_08_loaded).
    chain(Tone.Master);
    // bkcore.AudioTone.loop8.volume.value = -3;
    bkcore.AudioTone.loop8.loop = true;
  }

  function loop_08_loaded() {
    console.log('loop_08_loaded');
    bkcore.AudioTone.loops.push(bkcore.AudioTone.loop8);

  }

}

bkcore.AudioTone.playMouseOver = function() { // menu mouseOver
  if (bkcore.AudioTone.noiseMenu) bkcore.AudioTone.noiseMenu.triggerAttack();
  if (bkcore.AudioTone._clickMenuLoaded) {
    if (bkcore.AudioTone.clickMenu.state == 'stopped') {
      bkcore.AudioTone.clickMenu.playbackRate = 2;
      bkcore.AudioTone.clickMenu.start();
    }
  }


}




/*
██ ███    ██ ██ ████████     ███████ ███████ ██   ██
██ ████   ██ ██    ██        ██      ██       ██ ██
██ ██ ██  ██ ██    ██        ███████ █████     ███
██ ██  ██ ██ ██    ██             ██ ██       ██ ██
██ ██   ████ ██    ██        ███████ ██      ██   ██
*/


bkcore.AudioTone.initSfx = function() {

  bkcore.AudioTone.filter1 = new Tone.Filter(800, 'highpass');
  bkcore.AudioTone.dist1 = new Tone.Distortion(0.9);
  bkcore.AudioTone.chorus1 = new Tone.Chorus({
    frequency: '2n',
    delayTime: 3.5,
    depth: 0.7,
    type: 'sine',
    spread: 180
  });
  bkcore.AudioTone.tremolo1 = new Tone.Tremolo({
    frequency: '8n',
    type: 'sine',
    depth: 1,
    spread: 90
  }).start();
  bkcore.AudioTone.engineSynth1 = new Tone.FMSynth({
    portamento: 10,
    volume: -26,
    harmonicity: 4,
    modulationIndex: 10,
    detune: 0,
    oscillator: {
      type: 'pwm'
    },
    envelope: {
      attack: 0.01,
      decay: 0.01,
      sustain: 1,
      release: 0.5
    },
    modulation: {
      type: 'pulse'
    },
    modulationEnvelope: {
      attack: 0.5,
      decay: 0,
      sustain: 1,
      release: 0.5
    }
  }).chain(bkcore.AudioTone.filter1, bkcore.AudioTone.dist1,
    bkcore.AudioTone.chorus1, bkcore.AudioTone.tremolo1,
    Tone.Master);

  bkcore.AudioTone.engineSynth1.triggerAttack('C1')

  bkcore.AudioTone.tremolo2 = new Tone.Tremolo({
    frequency: '8n',
    type: 'sine',
    depth: 0,
    spread: 90
  }).start();
  bkcore.AudioTone.dist2 = new Tone.Distortion({
    wet: 0.2
  });
  bkcore.AudioTone.engineSynth2 = new Tone.FMSynth({
    volume: 0,
    harmonicity: 0,
    modulationIndex: 23,
    detune: 0,
    oscillator: {
      type: 'pulse'
    },
    envelope: {
      attack: 0.01,
      decay: 0.01,
      sustain: 1,
      release: 0.5
    },
    modulation: {
      type: 'square'
    },
    modulationEnvelope: {
      attack: 0.5,
      decay: 0,
      sustain: 1,
      release: 0.5
    }
  }).chain(bkcore.AudioTone.dist2, bkcore.AudioTone.tremolo2,
    Tone.Master);

  // boost noise
  bkcore.AudioTone.thrustNoiseFilter = new Tone.Filter(800);
  bkcore.AudioTone.thrustNoise = new Tone.Noise({
    volume: -99,
    type: 'white',
    playbackRate: 1
  }).chain(bkcore.AudioTone.thrustNoiseFilter,Tone.Master).start();

  //air break noise synth
  bkcore.AudioTone.airBreakSynthFilter = new Tone.Filter(1000, 'bandpass', -12);
  bkcore.AudioTone.airBreakSynth = new Tone.MetalSynth({
    frequency: 233,
    envelope: {
      attack: 1,
      decay: 1.4,
      release: 1
    },
    harmonicity: 5.1,
    modulationIndex: 218,
    resonance: 2700,
    octaves: 1.5
  }).chain(bkcore.AudioTone.airBreakSynthFilter, Tone.Master);


  // boost synth
  bkcore.AudioTone.filter1 = new Tone.Filter(1000, 'highpass');
  bkcore.AudioTone.boostOsc = new Tone.AMOscillator({
    volume: -99,
    frequency: 'C6',
    type: 'sine',
    modulationType: 'square',
    harmonicity: 2
  }).chain(bkcore.AudioTone.filter1, Tone.Master);


}


/*
███    ███  █████  ██████  ██████  ██ ███    ██  ██████  ███████
████  ████ ██   ██ ██   ██ ██   ██ ██ ████   ██ ██       ██
██ ████ ██ ███████ ██████  ██████  ██ ██ ██  ██ ██   ███ ███████
██  ██  ██ ██   ██ ██      ██      ██ ██  ██ ██ ██    ██      ██
██      ██ ██   ██ ██      ██      ██ ██   ████  ██████  ███████
*/
bkcore.AudioTone.gameOverFlag = false;
bkcore.AudioTone.startForwardFlag = false;

bkcore.AudioTone.setListenerVelocity = function(vec) {
  if (bkcore.AudioTone.engineSynth) {
    // console.log(vec.y);
  }
};


bkcore.AudioTone.setListenerSpeed = function(speed) {
  bkcore.AudioTone.speed = Math.floor(speed);
  if (bkcore.AudioTone.startForwardFlag && !bkcore.AudioTone.gameOverFlag) {
    // engine synth 2
    bkcore.AudioTone.engineSynth2.triggerAttack('C2');
    bkcore.AudioTone.engineSynth2.harmonicity.linearRampTo(50, 10);
    bkcore.AudioTone.tremolo1.frequency.linearRampTo('16n', 5);
    bkcore.AudioTone.tremolo2.frequency.linearRampTo('16n', 5);
    bkcore.AudioTone.tremolo2.depth.linearRampTo('1', 3);
  }
};

bkcore.AudioTone.speedUp = function(speed) {
  if (bkcore.AudioTone.engineSynth1) {
    //engine synth 1
    bkcore.AudioTone.engineSynth1.set('portamento', 10);
    bkcore.AudioTone.engineSynth1.setNote('C5');
    //noise
    bkcore.AudioTone.thrustNoise.volume.linearRampTo(-12, 0.01);
    bkcore.AudioTone.thrustNoiseFilter.frequency.linearRampTo(800, 1)
  }
};

bkcore.AudioTone.speedDown = function(speed) {
  if (bkcore.AudioTone.engineSynth1) {
    //engine synth 1
    bkcore.AudioTone.engineSynth1.set('portamento', 0.4);
    bkcore.AudioTone.engineSynth1.triggerAttack('C1');
    // noise
    bkcore.AudioTone.thrustNoise.volume.linearRampTo(-99, 1);
    bkcore.AudioTone.thrustNoiseFilter.frequency.linearRampTo(80, 1)
  }
};

bkcore.AudioTone.startForward = function() {
  bkcore.AudioTone.startForwardFlag = true;
};

bkcore.AudioTone.stopForward = function() {
  bkcore.AudioTone.startForwardFlag = false;
  if (!bkcore.AudioTone.gameOverFlag) {
    // noise
    bkcore.AudioTone.thrustNoise.volume.linearRampTo(-99, 1);
    bkcore.AudioTone.thrustNoiseFilter.frequency.linearRampTo(80, 1)
    //engine synth 2
    bkcore.AudioTone.engineSynth2.triggerRelease('+0.2');
    // bkcore.AudioTone.engineSynth2.triggerRelease('+0.5');
    bkcore.AudioTone.engineSynth2.harmonicity.linearRampTo(3, 0.2);
    bkcore.AudioTone.tremolo2.frequency.linearRampTo('4n', 0.2);
    bkcore.AudioTone.tremolo2.depth.linearRampTo('0', 0.2);
  }
};

bkcore.AudioTone.crash = function() {
  if (bkcore.AudioTone._crashLoaded && !bkcore.AudioTone.gameOverFlag) {
    bkcore.AudioTone.boostOsc.frequency.exponentialRampTo('C6', 0.2);
    bkcore.AudioTone.boostOsc.harmonicity.linearRampTo(0.1, 0.2);
    Tone.Transport.schedule(function(time) {
      bkcore.AudioTone.boostOsc.volume.linearRampTo(-99, 0.2);
      bkcore.AudioTone.boostOsc.stop('+0.2');
    }, '+0.2');
    bkcore.AudioTone.crashPlayer.volume.value = -6;
    bkcore.AudioTone.crashPlayer.playbackRate = (Math.random() + 0.5);
    bkcore.AudioTone.crashPlayer.start();
  }
  if (!bkcore.AudioTone.gameOverFlag) {
    bkcore.AudioTone.boostOsc.volume.linearRampTo(-99, 0.2);
    bkcore.AudioTone.boostOsc.stop('+0.2');
    //engine synth 1
    bkcore.AudioTone.tremolo1.frequency.linearRampTo('4n', 1);
    bkcore.AudioTone.engineSynth1.set('portamento', 0.4);
    bkcore.AudioTone.engineSynth1.triggerAttack('C1');
    // noise
    bkcore.AudioTone.thrustNoise.volume.linearRampTo(-99, 0.1);
    //engine synth 2
    bkcore.AudioTone.engineSynth2.triggerAttackRelease('C0', '0.3');
    bkcore.AudioTone.engineSynth2.triggerRelease('+0.3');
    bkcore.AudioTone.engineSynth2.harmonicity.linearRampTo(3, 0.1);
    bkcore.AudioTone.tremolo2.frequency.linearRampTo('4n', 0.1);
    bkcore.AudioTone.tremolo2.depth.linearRampTo('0', 0.1);
  }
};

bkcore.AudioTone.boostOn = function() {
  if (bkcore.AudioTone.engineSynth1 && !bkcore.AudioTone.gameOverFlag) {
    bkcore.AudioTone.boostOsc.frequency.value = 'C6';
    bkcore.AudioTone.boostOsc.harmonicity.value = 2;
    bkcore.AudioTone.boostOsc.frequency.exponentialRampTo('C9', 2);
    bkcore.AudioTone.boostOsc.harmonicity.linearRampTo(2, 2);
    bkcore.AudioTone.boostOsc.volume.linearRampTo(-26, 0.1);
    bkcore.AudioTone.boostOsc.start();
    Tone.Transport.schedule(function(time) {
      bkcore.AudioTone.boostOsc.volume.linearRampTo(-99, 1);
      bkcore.AudioTone.boostOsc.stop('+1');
    }, '+1');

    //engine synth 1
    bkcore.AudioTone.tremolo1.frequency.linearRampTo('32n', 1);
    bkcore.AudioTone.engineSynth1.modulationIndex.linearRampTo(20, 10);
    bkcore.AudioTone.engineSynth1.harmonicity.linearRampTo(8, 10);
    //engine synth 2
    bkcore.AudioTone.tremolo2.frequency.linearRampTo('32n', 1);
    bkcore.AudioTone.engineSynth2.harmonicity.linearRampTo(100, 10);
    // noise
    bkcore.AudioTone.thrustNoiseFilter.frequency.linearRampTo((Math.random() * 6000 + 6000), 0.1)
  }
};

bkcore.AudioTone.boostOff = function() {
  if (bkcore.AudioTone.engineSynth1 && !bkcore.AudioTone.gameOverFlag) {
    bkcore.AudioTone.engineSynth1.modulationIndex.linearRampTo(10, 0.3);
    bkcore.AudioTone.engineSynth1.harmonicity.linearRampTo(4, 0.3);
    //noise
    bkcore.AudioTone.thrustNoiseFilter.frequency.linearRampTo(1000, 0.1)
  }
};

bkcore.AudioTone.airBreakOn = function () {
  bkcore.AudioTone.airBreakSynthFilter.frequency.value = Math.random()*1000+500
  bkcore.AudioTone.airBreakSynth.triggerAttack();
}

bkcore.AudioTone.airBreakOff = function () {
  bkcore.AudioTone.airBreakSynth.triggerRelease();
}

bkcore.AudioTone.gameOver = function() {
  bkcore.AudioTone.alarmLooper.stop();
  bkcore.AudioTone.crashPlayer.playbackRate = 0.5;
  bkcore.AudioTone.crashPlayer.start();
  bkcore.AudioTone.gameOverFlag = true;
  bkcore.AudioTone.padPart.start();
  bkcore.AudioTone.padSynth.volume.linearRampTo(-12, 1);
  if (bkcore.AudioTone.engineSynth1) bkcore.AudioTone.engineSynth1.dispose();
  if (bkcore.AudioTone.engineSynth2) bkcore.AudioTone.engineSynth2.dispose();
  bkcore.AudioTone.loops[bkcore.AudioTone.indexOld].stop();
  if (bkcore.AudioTone.looper) bkcore.AudioTone.looper.dispose();
};
