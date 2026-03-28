import Foundation

enum Route: Hashable {
    case cardDetail(RecommendationCard)
    case passReasonPicker(RecommendationCard)
    case cantReasonPicker(RecommendationCard)
    case followUpLearning(RecommendationCard)
    case postActivityConfirmation(RecommendationCard)
    case notificationPreview
    case weeklyDigest
}
