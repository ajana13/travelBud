import SwiftUI

struct DigestItemView: View {
    let card: RecommendationCard
    @Environment(\.openURL) private var openURL

    private var gradientColors: [Color] {
        switch card.pillar {
        case .events: [.eventGradientStart, .eventGradientEnd]
        case .dining: [.diningGradientStart, .diningGradientEnd]
        case .outdoors: [.outdoorsGradientStart, .outdoorsGradientEnd]
        }
    }

    private var pillarEmoji: String {
        switch card.pillar {
        case .events: "🎶"
        case .dining: "🍴"
        case .outdoors: "⛰"
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image
            LinearGradient(
                colors: gradientColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 80)
            .overlay {
                Text(pillarEmoji)
                    .font(.system(size: 28))
            }

            VStack(alignment: .leading, spacing: 6) {
                Text(card.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                HStack(spacing: 4) {
                    Text(card.pillar.displayText)
                    Text("·")
                    Text(card.location)
                    Text("·")
                    Text(card.priceBand.displayText)
                }
                .font(.caption)
                .foregroundStyle(.secondary)

                if let fact = card.explanationFacts.first {
                    Text(fact)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                Button {
                    if let url = card.deepLinkURL {
                        openURL(url)
                    }
                } label: {
                    Text("Check it out")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color.letsGoBlue)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .padding(.top, 4)
            }
            .padding(14)
        }
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color(.systemGray5), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}
