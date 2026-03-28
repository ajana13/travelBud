import SwiftUI

enum NotificationType: String, Hashable {
    case recommendation
    case learning
}

struct NotificationPreview: Identifiable, Hashable {
    let id: String
    let type: NotificationType
    let title: String
    let body: String
    let venueName: String?
    let priceInfo: String?
    let timeAgo: String
    let ttlMinutes: Int?

    var accentColor: Color {
        switch type {
        case .recommendation: .blue
        case .learning: .purple
        }
    }
}
