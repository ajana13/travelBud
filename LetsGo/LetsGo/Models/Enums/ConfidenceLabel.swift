import SwiftUI

enum ConfidenceLabel: String, Codable, Hashable {
    case strongMatch
    case learning
    case new

    var displayText: String {
        switch self {
        case .strongMatch: "Strong match"
        case .learning: "Learning"
        case .new: "New"
        }
    }

    var displayColor: Color {
        switch self {
        case .strongMatch: .strongMatchGreen
        case .learning: .learningOrange
        case .new: .newPurple
        }
    }
}
