import Foundation

enum PassReason: String, Codable, CaseIterable, Hashable {
    case notMyStyle
    case tooExpensive
    case tooFar
    case wrongTiming
    case beenBefore
    case somethingElse

    var displayText: String {
        switch self {
        case .notMyStyle: "Not my kind of thing"
        case .tooExpensive: "Too expensive"
        case .tooFar: "Too far away"
        case .wrongTiming: "Wrong time / schedule"
        case .beenBefore: "Already been there"
        case .somethingElse: "Something else"
        }
    }
}
