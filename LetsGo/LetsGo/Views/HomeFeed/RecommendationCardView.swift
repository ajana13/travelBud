import SwiftUI

struct RecommendationCardView: View {
    let card: RecommendationCard
    let onTap: () -> Void
    let onAction: (ActionType) -> Void

    private var gradientColors: [Color] {
        switch card.pillar {
        case .events:
            [.eventGradientStart, .eventGradientEnd]
        case .dining:
            [.diningGradientStart, .diningGradientEnd]
        case .outdoors:
            [.outdoorsGradientStart, .outdoorsGradientEnd]
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
            // Image area
            ZStack(alignment: .topTrailing) {
                LinearGradient(
                    colors: gradientColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .frame(height: 130)
                .overlay {
                    Text(pillarEmoji)
                        .font(.system(size: 44))
                }

                ConfidenceBadge(label: card.confidenceLabel)
                    .padding(10)
            }
            .onTapGesture(perform: onTap)

            // Card body
            VStack(alignment: .leading, spacing: 8) {
                Text(card.title)
                    .font(.headline)
                    .foregroundStyle(.primary)

                HStack(spacing: 4) {
                    Text(card.pillar.displayText)
                    Text("·")
                    Text(card.location)
                    Text("·")
                    Text(card.priceBand.displayText)
                    Text("·")
                    Text(card.availability)
                }
                .font(.caption)
                .foregroundStyle(.secondary)

                if let firstFact = card.explanationFacts.first {
                    Text(firstFact)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                TagsView(tags: card.tags)

                ActionButtonBar(onAction: onAction)
            }
            .padding(14)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}
