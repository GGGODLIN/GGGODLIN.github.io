import AppKit
import Foundation

guard CommandLine.arguments.count == 2 else {
    FileHandle.standardError.write(Data("usage: swift set-html-clipboard.swift <html-file>\n".utf8))
    exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let html = try String(contentsOf: inputURL, encoding: .utf8)
let pasteboard = NSPasteboard.general

pasteboard.clearContents()
pasteboard.declareTypes([.html, .string], owner: nil)

guard pasteboard.setString(html, forType: .html) else {
    FileHandle.standardError.write(Data("failed to set HTML clipboard flavor\n".utf8))
    exit(1)
}

guard pasteboard.setString(" ", forType: .string) else {
    FileHandle.standardError.write(Data("failed to set plain-text clipboard fallback\n".utf8))
    exit(1)
}

print("html_bytes=\(html.utf8.count) plain_text_bytes=1")
