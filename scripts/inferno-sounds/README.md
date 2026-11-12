# Inferno demonic alert sounds (ElevenLabs)

Stems in `elevenlabs/`: voice lines from ElevenLabs TTS (eleven_multilingual_v2) and
backgrounds from ElevenLabs sound generation. Final files = voice (delayed 0.4 s, -16 LUFS)
over its effect (-28 LUFS), mixed and normalized to -16 LUFS with ffmpeg.

| File | Voice (library id) | Line | Background |
|---|---|---|---|
| blocked_demon_a.mp3 | Matthew Schmitz, Unholy Wicked Demon (rCYFsCX2waxtHCgVD0e8) | "Mortal... your command is required." | fx_blocked: hellish rumble, fire, growl |
| done_demon_a.mp3 | Matthew Schmitz (rCYFsCX2waxtHCgVD0e8) | "The deed... is done." | fx_done: cathedral bell and doom gong |
| blocked_demon_b.mp3 | Malyx, Echoey Menacing Deep Demon (vfaqCOvlrKi4Zp7C2IAm) | "Mortal... your command is required." | fx_blocked |
| done_demon_b.mp3 | Malyx (vfaqCOvlrKi4Zp7C2IAm) | "The deed... is done." | fx_done |

Remix one:

    ffmpeg -i elevenlabs/v_unholy_done.mp3 -i elevenlabs/fx_done.mp3 -filter_complex "[0:a]loudnorm=I=-16:TP=-2,aresample=44100,adelay=400|400[v];[1:a]loudnorm=I=-28:TP=-8,aresample=44100[f];[f][v]amix=inputs=2:normalize=0:duration=longest,apad=pad_dur=0.3,loudnorm=I=-16:TP=-1.5" -ac 2 -b:a 192k out.mp3
