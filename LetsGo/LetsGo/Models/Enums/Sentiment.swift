import Foundation

enum Sentiment: String, Codable, Hashable {
    case loved
    case okay
    case didntGo

    var displayText: String {
        switch self {
        case .loved: "Yes, loved it!"
        case .okay: "Went, it was okay"
        case .didntGo: "Didn't end up going"
        }
    }

    var emoji: String {
        switch self {
        case .loved: "👍"
        case .okay: "😐"
        case .didntGo: "👋"
        }
    }
}
