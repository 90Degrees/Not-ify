#!/usr/bin/env node --harmony

var program     = require('commander')
var sonos       = require('sonos')
var Sonos       = require('sonos').Sonos
var chalk       = require('chalk');

let new_order_thwarted = 0;

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


program
  .arguments('<ip>')
  .action(function(ip) {
    console.log(chalk.blue("No Order - Stops Sonos from Playing New Order - V1"));
    sonos.search(function (sonos) {
        if(sonos.host === ip) {
          console.log(chalk.green("Connected"));
          sonos_class = new Sonos(sonos.host)
          setInterval(function() {
            sonos.currentTrack(function (err, track) {
              if(typeof track.artist !== 'undefined') {
                let artist_slug = slugify(track.artist + track.title);
                process.stdout.clearLine();
                process.stdout.write(chalk.green("Now Playing: ") + track.artist + " - " + track.title + " | " + chalk.blue(fancyTimeFormat(track.position) + "/" + fancyTimeFormat(track.duration)) + " | " + "New Order has been skipped " + new_order_thwarted + " times" + "\r");                
                if(artist_slug.indexOf('neworder') !== -1) {
                  new_order_thwarted++;
                  sonos.next(function (err, nexted) {});
                  process.stdout.clearLine();
                  process.stdout.write(chalk.red("New Order Detected, Skipping") + "\r");
                }
              }
            })
          }, 5000);
        }
    })
  }).parse(process.argv);
  