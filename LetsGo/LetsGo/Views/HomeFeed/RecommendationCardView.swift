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

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image area
            ZStack(alignment: .topTrailing) {
                if let imageURL = card.imageURL {
                    AsyncImage(url: imageURL) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                        default:
                            fallbackHero
                        }
                    }
                    .frame(height: 130)
                    .clipped()
                } else {
                    fallbackHero
                        .frame(height: 130)
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
                    Text(card.itineraryTheme)
                    Text("·")
                    Text(card.bestForTimeOfDay)
                    Text("·")
                    Text(card.estimatedDuration)
                }
                .font(.caption)
                .foregroundStyle(.secondary)

                if let firstFact = card.explanationFacts.first {
                    Text(firstFact)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                VStack(alignment: .leading, spacing: 6) {
                    ForEach(Array(card.itineraryStops.prefix(3).enumerated()), id: \.offset) { idx, stop in
                        Text("\(idx + 1). \(stop)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }

                TagsView(tags: [card.bestForSeason, card.availability] + card.tags)

                ActionButtonBar(onAction: onAction)
            }
            .padding(14)
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var fallbackHero: some View {
        LinearGradient(
            colors: gradientColors,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay {
            Image(systemName: card.pillar.iconName)
                .font(.system(size: 44, weight: .semibold))
                .foregroundStyle(.white.opacity(0.92))
        }
    }
}
