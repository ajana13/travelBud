import Foundation

enum ActionType: String, Codable, CaseIterable, Hashable {
    case imIn
    case maybe
    case pass
    case cant

    var displayText: String {
        switch self {
        case .imIn: "I'm in"
        case .maybe: "Maybe"
        case .pass: "Pass"
        case .cant: "Can't"
        }
    }

    /// Whether tapping this action should open a reason picker
    var requiresReason: Bool {
        switch self {
        case .pass, .cant: true
        case .imIn, .maybe: false
        }
    }
}
