#!/usr/bin/env node --harmony

const program     = require('commander')
const sonos       = require('sonos')
const Sonos       = require('sonos').Sonos
const chalk       = require('chalk');
const fs          = require('fs');
var blocked       = require('./artists.json');


function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '')           
    .replace(/[^\w\-]+/g, '')       
    .replace(/\-\-+/g, '')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
}

function fancyTimeFormat(time) {   
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;
    var ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

function watchSonos(ip, blocked) {
  sonos.search(function (sonos) {
    if(sonos.host === ip) {
      console.log(chalk.green("Connected"));
      sonos_class = new Sonos(sonos.host)
      setInterval(function() {
        sonos.currentTrack(function (err, track) {
          if(typeof track.artist !== 'undefined') {
            process.stdout.clearLine();
            for(let i = 0; i < blocked.artists.length; i ++) {
            let artist_slug = slugify(track.artist + track.title);
            let block_slug  = slugify(blocked.artists[i]);
            process.stdout.write(chalk.green("Now Playing: ") + track.artist + " - " + track.title + " | " + chalk.blue(fancyTimeFormat(track.position) + "/" + fancyTimeFormat(track.duration)) + "\r");
              if(!artist_slug.indexOf(block_slug)) {
                sonos.next(function (err, nexted) {});
                process.stdout.clearLine();
                process.stdout.write(chalk.red(blocked.artists[i] + " Detected, Skipping") + "\r");
              }
            }            
          }
        })
      }, 5000);
    }
})
}

program
  .arguments('<ip>')
  .option('-b, --blocklist <file>', 'Json file of artists to block')
  .action(function(ip) {
    console.log(chalk.blue("Not-ify - Take control of your Sonos"));
    
    if(program.blocklist) {
      fs.readFile('./' + program.blocklist, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        console.log(data);
        watchSonos(ip, JSON.parse(data));
      });
    } else {
      watchSonos(ip, blocked);
    }
    
  }).parse(process.argv);
  