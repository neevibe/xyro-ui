// Tiny bridge to macOS Personal Voice — Apple's free, fully on-device voice
// clone. `say` can't reach Personal Voices; AVSpeechSynthesizer can, after
// the user grants access (System Settings → Accessibility → Personal Voice →
// "Allow applications to request to use").
//
// Build:  swiftc -O -o bin/personal-say src/voice/personal-say.swift
// Usage:  personal-say list          — print available personal voices
//         personal-say speak <text>  — speak with the first personal voice

import AVFoundation
import Foundation

func spin(until done: () -> Bool, timeout: TimeInterval) {
    let deadline = Date().addingTimeInterval(timeout)
    while !done() && Date() < deadline {
        RunLoop.current.run(until: Date().addingTimeInterval(0.05))
    }
}

// authorization (first call shows the system prompt)
var status = AVSpeechSynthesizer.PersonalVoiceAuthorizationStatus.notDetermined
var answered = false
AVSpeechSynthesizer.requestPersonalVoiceAuthorization { s in
    status = s
    answered = true
}
spin(until: { answered }, timeout: 60)

func personalVoices() -> [AVSpeechSynthesisVoice] {
    AVSpeechSynthesisVoice.speechVoices().filter { $0.voiceTraits.contains(.isPersonalVoice) }
}

let args = CommandLine.arguments

if args.count >= 2 && args[1] == "list" {
    guard status == .authorized else {
        print("unauthorized")
        exit(2)
    }
    let voices = personalVoices()
    guard !voices.isEmpty else {
        print("none")
        exit(1)
    }
    for v in voices { print("\(v.identifier)\t\(v.name)") }
    exit(0)
}

if args.count >= 3 && args[1] == "speak" {
    guard status == .authorized, let voice = personalVoices().first else {
        FileHandle.standardError.write("no authorized personal voice\n".data(using: .utf8)!)
        exit(1)
    }
    let synth = AVSpeechSynthesizer()
    let utterance = AVSpeechUtterance(string: args[2])
    utterance.voice = voice
    synth.speak(utterance)
    spin(until: { false }, timeout: 0.3) // let playback begin
    spin(until: { !synth.isSpeaking }, timeout: 120)
    exit(0)
}

print("usage: personal-say list | speak <text>")
exit(64)
