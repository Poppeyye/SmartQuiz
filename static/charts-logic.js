var _0x237184=_0x49f5;(function(_0x5b17cc,_0x288257){var _0x354806=_0x49f5,_0x28334a=_0x5b17cc();while(!![]){try{var _0x1ae8c8=parseInt(_0x354806(0x132))/0x1+parseInt(_0x354806(0x157))/0x2*(-parseInt(_0x354806(0x141))/0x3)+-parseInt(_0x354806(0x15d))/0x4+-parseInt(_0x354806(0x158))/0x5+parseInt(_0x354806(0x165))/0x6+-parseInt(_0x354806(0x14b))/0x7+-parseInt(_0x354806(0x164))/0x8*(-parseInt(_0x354806(0x15b))/0x9);if(_0x1ae8c8===_0x288257)break;else _0x28334a['push'](_0x28334a['shift']());}catch(_0x257b76){_0x28334a['push'](_0x28334a['shift']());}}}(_0x1edb,0x4f29f));let categoryColors=['rgba(255,\x2069,\x200,\x200.5)',_0x237184(0x13d),_0x237184(0x133),_0x237184(0x145),'rgba(0,\x20255,\x20255,\x200.5)',_0x237184(0x168),_0x237184(0x154),_0x237184(0x151),_0x237184(0x11e)];async function fetchAvgScores(){var _0x2b15e2=_0x237184,_0x1160b0={'JhvIF':_0x2b15e2(0x146)};try{return await(await fetch(_0x1160b0[_0x2b15e2(0x123)]))[_0x2b15e2(0x12f)]();}catch(_0x7fc0c8){return console['error'](_0x2b15e2(0x118),_0x7fc0c8),null;}}function _0x1edb(){var _0x4196f6=['getElementById','addEventListener','push','polarArea','rgba(0,\x20255,\x20255,\x200.8)','rgba(255,\x20140,\x200,\x200.5)','uKVRK','UzLiC','rgba(255,\x20140,\x200,\x200.8)','getContext','JhvIF','/get_category_percentages/','length','OhhJE','dataIndex','Qué\x20categorías\x20interesan\x20más?\x20%\x20partidas\x20jugadas','rgba(255,\x20255,\x20255,\x200.7)','error','rgba(30,\x20144,\x20255,\x200.8)','DOMContentLoaded','SrxAM','Ythry','json','chart-container','slice','342394ORAaGJ','rgba(30,\x20144,\x20255,\x200.5)','labels','observe','dSCHM','kXONm','#FF6384','anryt','EPpZu','data','RobJF','rgba(0,\x20128,\x200,\x200.5)','rgba(70,\x20130,\x20180,\x200.8)','FdznL','kGtlU','47826gtVCYW','rgba(0,\x200,\x200,\x200)','barChart','rgba(0,\x20128,\x200,\x200.8)','rgba(255,\x20215,\x200,\x200.5)','/get_average_scores/','white','FvSpq','/get_top_players/','rSwVh','1380568XTMWvf','TMXtI','bar','500','xzaaQ','toFixed','rgba(70,\x20130,\x20180,\x200.5)','sSFXf','kxfvp','rgba(0,\x20255,\x200,\x200.5)','rgba(255,\x20255,\x20255,\x200.85)','wshUY','12yfqeHd','955835CByoLf','forEach','eUCun','938988zslbLJ','VcZlg','681788yGvybt','percentages','CPfcA','WtgbE','isIntersecting','rgba(255,\x20215,\x200,\x200.8)','jTcPd','8oornMu','3192114gGyJos','PplRe','myChart','rgba(255,\x2020,\x20147,\x200.5)','datasets','myRadarChart','ZgtxH','kljuX','PHnTS','Arial,\x20sans-serif','rgba(0,\x20255,\x200,\x200.8)','bold','Error\x20fetching\x20top\x20players\x20data:','map','Error\x20fetching\x20data:'];_0x1edb=function(){return _0x4196f6;};return _0x1edb();}async function fetchTopPlayersData(){var _0x834e3c=_0x237184,_0x5dc4e8={'eUCun':function(_0x45454d,_0x9c54f2){return _0x45454d(_0x9c54f2);},'anryt':_0x834e3c(0x116)};try{return await(await _0x5dc4e8[_0x834e3c(0x15a)](fetch,_0x834e3c(0x149)))['json']();}catch(_0x39a582){return console[_0x834e3c(0x12a)](_0x5dc4e8[_0x834e3c(0x139)],_0x39a582),null;}}async function renderBarChart(){var _0x3fe679=_0x237184,_0xdffe77={'zsMaf':function(_0x261fc8,_0xf754d1){return _0x261fc8(_0xf754d1);},'TMXtI':_0x3fe679(0x124),'CPfcA':_0x3fe679(0x143),'ZgtxH':_0x3fe679(0x14d),'PplRe':'rgba(255,\x2069,\x200,\x200.8)','kxfvp':_0x3fe679(0x144),'kXONm':_0x3fe679(0x12b),'UzLiC':'rgba(255,\x2020,\x20147,\x200.8)','VcZlg':_0x3fe679(0x114),'oWaej':_0x3fe679(0x13e),'dSCHM':_0x3fe679(0x121),'sSFXf':_0x3fe679(0x128),'rSwVh':'Arial,\x20sans-serif'},_0x4aa7b5,_0x3ee3fc=await(await _0xdffe77['zsMaf'](fetch,_0xdffe77[_0x3fe679(0x14c)]))['json']();_0x3ee3fc&&(_0x4aa7b5=document[_0x3fe679(0x119)](_0xdffe77[_0x3fe679(0x15f)])[_0x3fe679(0x122)]('2d'),new Chart(_0x4aa7b5,{'type':_0xdffe77[_0x3fe679(0x16b)],'data':{'labels':_0x3ee3fc['categories'],'datasets':[{'data':_0x3ee3fc[_0x3fe679(0x15e)],'backgroundColor':[_0xdffe77[_0x3fe679(0x166)],_0xdffe77[_0x3fe679(0x153)],_0xdffe77[_0x3fe679(0x137)],_0x3fe679(0x162),_0x3fe679(0x11d),_0xdffe77[_0x3fe679(0x120)],_0xdffe77[_0x3fe679(0x15c)],_0xdffe77['oWaej'],_0xdffe77[_0x3fe679(0x136)]][_0x3fe679(0x131)](0x0,_0x3ee3fc['categories'][_0x3fe679(0x125)]),'borderColor':'rgba(255,\x20255,\x20255,\x200.7)','borderWidth':0x1}]},'options':{'plugins':{'legend':{'display':!0x1},'title':{'display':!0x0,'text':_0xdffe77[_0x3fe679(0x152)],'font':{'size':0x12,'weight':_0x3fe679(0x115),'family':_0xdffe77[_0x3fe679(0x14a)]},'color':'rgba(255,\x20255,\x20255,\x200.85)','padding':{'top':0xa,'bottom':0x1e}}},'scales':{'y':{'beginAtZero':!0x0}}}}));}async function renderChart(){var _0x414565=_0x237184,_0x247d0b={'kljuX':function(_0x38def3,_0x4d5851){return _0x38def3+_0x4d5851;},'kGtlU':_0x414565(0x167),'tvGlT':_0x414565(0x11c),'EPpZu':_0x414565(0x129),'jTcPd':'Promedio\x20global\x20de\x20puntos\x20por\x20categoría','WWank':_0x414565(0x155),'xzaaQ':_0x414565(0x115),'uKVRK':_0x414565(0x147)};let _0x5af3c9=await fetchAvgScores();var _0x315507;_0x5af3c9&&(_0x315507=document[_0x414565(0x119)](_0x247d0b[_0x414565(0x140)])['getContext']('2d'),new Chart(_0x315507,{'type':_0x247d0b['tvGlT'],'data':{'labels':_0x5af3c9[_0x414565(0x134)],'datasets':[{'data':_0x5af3c9[_0x414565(0x169)][0x0][_0x414565(0x13b)],'backgroundColor':categoryColors[_0x414565(0x131)](0x0,_0x5af3c9[_0x414565(0x134)][_0x414565(0x125)]),'borderColor':_0x247d0b[_0x414565(0x13a)],'borderWidth':0x1}]},'options':{'responsive':!0x0,'maintainAspectRatio':!0x0,'plugins':{'legend':{'display':!0x1},'tooltip':{'callbacks':{'label':function(_0x1fa5f0){var _0x21f9c9=_0x414565;return _0x247d0b[_0x21f9c9(0x16c)](_0x5af3c9[_0x21f9c9(0x134)][_0x1fa5f0[_0x21f9c9(0x127)]],':\x20')+_0x5af3c9['datasets'][0x0][_0x21f9c9(0x13b)][_0x1fa5f0[_0x21f9c9(0x127)]][_0x21f9c9(0x150)](0x2);}}},'title':{'display':!0x0,'text':_0x247d0b[_0x414565(0x163)],'font':{'size':0x12,'weight':'bold','family':_0x414565(0x113)},'color':_0x247d0b['WWank'],'padding':{'top':0xa,'bottom':0x1e}}},'scales':{'r':{'ticks':{'display':!0x0,'backdropColor':_0x414565(0x142),'color':_0x414565(0x147),'font':{'size':0xe}},'pointLabels':{'font':{'size':0xe,'weight':_0x247d0b[_0x414565(0x14f)]},'color':_0x247d0b[_0x414565(0x11f)]}}}}}));}function _0x49f5(_0x58cb93,_0x464fe8){var _0x1edb29=_0x1edb();return _0x49f5=function(_0x49f503,_0x1cfb98){_0x49f503=_0x49f503-0x112;var _0x26ad9b=_0x1edb29[_0x49f503];return _0x26ad9b;},_0x49f5(_0x58cb93,_0x464fe8);}async function renderRadarChart(){var _0x1926ee=_0x237184,_0x2fe66d={'WtgbE':'#FF9F40','SrxAM':'#FFCD56','FvSpq':function(_0x559790){return _0x559790();},'wshUY':_0x1926ee(0x16a),'JNTYB':function(_0x515dc4,_0x4220d6){return _0x515dc4+_0x4220d6;},'kvFgo':function(_0x13bbdf,_0x1eee1a){return _0x13bbdf%_0x1eee1a;},'NCeQr':function(_0x5d8e58,_0x3acfbd){return _0x5d8e58%_0x3acfbd;},'OhhJE':_0x1926ee(0x14e),'fqjPM':_0x1926ee(0x147),'PHnTS':'Top\x203\x20Jugadores\x20global','Ythry':'rgba(255,\x20255,\x20255,\x200.85)'},_0x4e6b74=[_0x1926ee(0x138),_0x2fe66d[_0x1926ee(0x160)],_0x2fe66d[_0x1926ee(0x12d)]],_0x3dea49=await _0x2fe66d[_0x1926ee(0x148)](fetchTopPlayersData);if(_0x3dea49){var _0x4a3c47=document[_0x1926ee(0x119)](_0x2fe66d[_0x1926ee(0x156)])[_0x1926ee(0x122)]('2d'),_0x516708=[],_0x58d15b=allCategories[_0x1926ee(0x117)](_0xb41ef5=>categoryNames[_0xb41ef5]);for(let [_0x38f560,_0x1a55a3]of Object['entries'](_0x3dea49['top_players'])){var _0x5a16c8=allCategories['map'](_0x46614f=>_0x1a55a3['scores'][_0x46614f]||0x0);_0x516708[_0x1926ee(0x11b)]({'label':_0x38f560,'data':_0x5a16c8,'backgroundColor':_0x2fe66d['JNTYB'](_0x4e6b74[_0x2fe66d['kvFgo'](_0x516708[_0x1926ee(0x125)],_0x4e6b74[_0x1926ee(0x125)])],'30'),'borderColor':_0x4e6b74[_0x2fe66d['NCeQr'](_0x516708[_0x1926ee(0x125)],_0x4e6b74[_0x1926ee(0x125)])],'borderWidth':0x2,'fill':!0x0});}new Chart(_0x4a3c47,{'type':'radar','data':{'labels':_0x58d15b,'datasets':_0x516708},'options':{'responsive':!0x0,'scales':{'r':{'angleLines':{'display':!0x0},'suggestedMin':0x0,'suggestedMax':0x64}},'elements':{'line':{'tension':0x0}},'plugins':{'legend':{'display':!0x0,'labels':{'font':{'size':0x10,'weight':_0x2fe66d[_0x1926ee(0x126)]},'color':_0x2fe66d['fqjPM']}},'title':{'display':!0x0,'text':_0x2fe66d[_0x1926ee(0x112)],'font':{'size':0x12,'weight':'bold'},'color':_0x2fe66d[_0x1926ee(0x12e)]}}}});}}document[_0x237184(0x11a)](_0x237184(0x12c),function(){var _0x5cfe1c=_0x237184,_0x13b40b={'RobJF':function(_0x1ba93a){return _0x1ba93a();},'FdznL':_0x5cfe1c(0x130)};let _0x4a2820=document[_0x5cfe1c(0x119)](_0x13b40b[_0x5cfe1c(0x13f)]),_0xe110d=new IntersectionObserver(_0x5ea869=>{var _0x493dc3=_0x5cfe1c;_0x5ea869[_0x493dc3(0x159)](_0x4ba565=>{var _0x4aa2c3=_0x493dc3;_0x4ba565[_0x4aa2c3(0x161)]&&(renderChart(),_0x13b40b[_0x4aa2c3(0x13c)](renderRadarChart),_0x13b40b[_0x4aa2c3(0x13c)](renderBarChart),_0xe110d['unobserve'](_0x4a2820));});});_0xe110d[_0x5cfe1c(0x135)](_0x4a2820);});