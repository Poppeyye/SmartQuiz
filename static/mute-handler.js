const _0x4657b4=_0x3221;function _0x2d7f(){const _0x588561=['.icon-sound','currentTime','.icon-muted','1691459UiqsHY','classList','8148cNSSJS','getElementById','wktUR','active','wrong','80523cvysPy','1596bDwBKm','loop','querySelector','3495FUwOMV','pause','3430180Jniopb','qTQIJ','muted','addEventListener','VDaop','GfseX','none','isMuted','390HJOGmm','beforeunload','style','440076iZJzrU','yoRfQ','background','correct','volume','311368YMPWdz','mute-button','216mRyAVw','true','display','flex'];_0x2d7f=function(){return _0x588561;};return _0x2d7f();}(function(_0xa2777e,_0x578b66){const _0x4dd232=_0x3221,_0x3e444b=_0xa2777e();while(!![]){try{const _0x7e8861=parseInt(_0x4dd232(0x8d))/0x1+parseInt(_0x4dd232(0x88))/0x2+-parseInt(_0x4dd232(0x85))/0x3*(parseInt(_0x4dd232(0x98))/0x4)+-parseInt(_0x4dd232(0x7b))/0x5*(parseInt(_0x4dd232(0x78))/0x6)+parseInt(_0x4dd232(0x96))/0x7+parseInt(_0x4dd232(0x8f))/0x8*(parseInt(_0x4dd232(0x77))/0x9)+-parseInt(_0x4dd232(0x7d))/0xa;if(_0x7e8861===_0x578b66)break;else _0x3e444b['push'](_0x3e444b['shift']());}catch(_0x48c5f7){_0x3e444b['push'](_0x3e444b['shift']());}}}(_0x2d7f,0x35eb2));let muteButton=document[_0x4657b4(0x99)](_0x4657b4(0x8e)),isMuted=_0x4657b4(0x90)===localStorage['getItem'](_0x4657b4(0x84)),backgroundMusic=new Audio(audioUrls[_0x4657b4(0x8a)]),correctSound=(backgroundMusic[_0x4657b4(0x79)]=!0x0,new Audio(audioUrls[_0x4657b4(0x8b)])),wrongSound=new Audio(audioUrls[_0x4657b4(0x9c)]),welcomeSound=new Audio(audioUrls['welcome']);function toggleMute(){const _0x35a0b5=_0x4657b4,_0x66ad19={'wktUR':_0x35a0b5(0x9b),'VDaop':_0x35a0b5(0x93),'qTQIJ':_0x35a0b5(0x95),'GfseX':_0x35a0b5(0x83)};isMuted?(backgroundMusic[_0x35a0b5(0x7f)]=!0x0,correctSound[_0x35a0b5(0x7f)]=!0x0,wrongSound[_0x35a0b5(0x7f)]=!0x0,welcomeSound[_0x35a0b5(0x7f)]=!0x0,muteButton&&(muteButton[_0x35a0b5(0x97)]['add'](_0x66ad19['wktUR']),muteButton['querySelector'](_0x66ad19[_0x35a0b5(0x81)])[_0x35a0b5(0x87)][_0x35a0b5(0x91)]=_0x35a0b5(0x83),muteButton[_0x35a0b5(0x7a)](_0x66ad19[_0x35a0b5(0x7e)])['style'][_0x35a0b5(0x91)]=_0x35a0b5(0x92))):(backgroundMusic['muted']=!0x1,correctSound['muted']=!0x1,wrongSound[_0x35a0b5(0x7f)]=!0x1,muteButton&&(muteButton[_0x35a0b5(0x97)]['remove'](_0x66ad19[_0x35a0b5(0x9a)]),muteButton['querySelector']('.icon-sound')[_0x35a0b5(0x87)]['display']=_0x35a0b5(0x92),muteButton['querySelector'](_0x66ad19[_0x35a0b5(0x7e)])['style'][_0x35a0b5(0x91)]=_0x66ad19[_0x35a0b5(0x82)]));}function _0x3221(_0x38108c,_0x45ceb3){const _0x2d7ffb=_0x2d7f();return _0x3221=function(_0x322180,_0x19fd37){_0x322180=_0x322180-0x77;let _0x2ab808=_0x2d7ffb[_0x322180];return _0x2ab808;},_0x3221(_0x38108c,_0x45ceb3);}backgroundMusic[_0x4657b4(0x8c)]=0.1,correctSound[_0x4657b4(0x8c)]=0.5,wrongSound[_0x4657b4(0x8c)]=0.5,welcomeSound[_0x4657b4(0x8c)]=0.5,muteButton&&muteButton['addEventListener']('click',()=>{const _0x80bdba=_0x4657b4,_0x3783e9={'tqVDj':_0x80bdba(0x84),'yoRfQ':function(_0x7e6a4a){return _0x7e6a4a();}};isMuted=!isMuted,localStorage['setItem'](_0x3783e9['tqVDj'],isMuted),_0x3783e9[_0x80bdba(0x89)](toggleMute);}),window[_0x4657b4(0x80)](_0x4657b4(0x86),function(){const _0x3c1ac3=_0x4657b4;backgroundMusic&&(backgroundMusic[_0x3c1ac3(0x7c)](),backgroundMusic[_0x3c1ac3(0x94)]=0x0);}),toggleMute();export{isMuted,backgroundMusic,correctSound,wrongSound,welcomeSound};