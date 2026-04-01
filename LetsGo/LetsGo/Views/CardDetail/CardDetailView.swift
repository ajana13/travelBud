import SwiftUI

struct CardDetailView: View {
    @Environment(AppState.self) private var appState
    @Environment(AppRouter.self) private var router
    @Environment(\.openURL) private var openURL

    let card: RecommendationCard
    @State private var viewModel: CardDetailViewModel?

    private var gradientColors: [Color] {
        switch card.pillar {
        case .events: [.eventGradientStart, .eventGradientEnd]
        case .dining: [.diningGradientStart, .diningGradientEnd]
        case .outdoors: [.outdoorsGradientStart, .outdoorsGradientEnd]
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Hero image
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
                    .frame(height: 200)
                    .clipped()
                } else {
                    fallbackHero
                        .frame(height: 200)
                }

                VStack(alignment: .leading, spacing: 18) {
                    // Title + badge
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(card.title)
                                .font(.title2)
                                .fontWeight(.bold)

                            HStack(spacing: 4) {
                                Text(card.itineraryTheme)
                                Text("·")
                                Text(card.bestForTimeOfDay)
                                Text("·")
                                Text(card.estimatedDuration)
                            }
                            .font(.subheadline)
                            .foregroundStyle(.secondary)

                            Text("\(card.location) · \(card.availability)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        Spacer()

                        ConfidenceBadge(label: card.confidenceLabel)
                    }

                    // Explanation
                    ExplanationSection(facts: card.explanationFacts)

                    detailSection(
                        title: "Itinerary flow",
                        icon: "map.fill",
                        items: card.itineraryStops
                    )

                    // Travel plan details only in expanded detail panel
                    detailSection(
                        title: "How to get there",
                        icon: "map",
                        items: card.itinerarySteps
                    )

                    detailSection(
                        title: "Know before you go",
                        icon: "checklist",
                        items: card.arrivalChecklist
                    )

                    // Tags
                    TagsView(tags: [card.bestForSeason, card.availability, card.priceBand.displayText, card.socialMode] + card.tags)

                    // Primary actions
                    HStack(spacing: 8) {
                        Button {
                            handleAction(.imIn)
                        } label: {
                            Text("I'm in")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(Color.imInGreen)
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }

                        Button {
                            handleAction(.maybe)
                        } label: {
                            Text("Maybe")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(Color(.systemGray5))
                                .foregroundStyle(.primary)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }

                    // Secondary actions
                    HStack(spacing: 8) {
                        Button {
                            handleAction(.pass)
                        } label: {
                            Text("Pass")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .foregroundStyle(.secondary)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color(.systemGray4), lineWidth: 1)
                                )
                        }

                        Button {
                            handleAction(.cant)
                        } label: {
                            Text("Can't")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .foregroundStyle(Color(.systemGray3))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(Color(.systemGray5), lineWidth: 1)
                                )
                        }
                    }

                    // Deep-link out
                    if card.deepLinkURL != nil {
                        Button {
                            if let url = card.deepLinkURL {
                                openURL(url)
                            }
                        } label: {
                            HStack {
                                Text("View on venue site")
                                Image(systemName: "arrow.up.right")
                            }
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .foregroundStyle(Color.letsGoBlue)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.letsGoBlue, lineWidth: 1)
                            )
                        }
                    }
                }
                .padding(22)
            }
        }
        .background(Color(.systemBackground))
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if viewModel == nil {
                viewModel = CardDetailViewModel(card: card, apiClient: appState.apiClient)
            }
        }
    }

    private func handleAction(_ type: ActionType) {
        switch type {
        case .imIn:
            appState.markRecommendationHandled(card)
            appState.registerImIn(card: card)
            Task { await viewModel?.performAction(.imIn) }
            router.popToRoot()
        case .maybe:
            appState.markRecommendationHandled(card)
            Task { await viewModel?.performAction(.maybe) }
            router.popToRoot()
        case .pass:
            appState.markRecommendationHandled(card)
            router.navigate(to: .passReasonPicker(card))
        case .cant:
            appState.markRecommendationHandled(card)
            router.navigate(to: .cantReasonPicker(card))
        }
    }

    private var fallbackHero: some View {
        LinearGradient(
            colors: gradientColors,
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay {
            Image(systemName: card.pillar.iconName)
                .font(.system(size: 56, weight: .semibold))
                .foregroundStyle(.white.opacity(0.92))
        }
    }

    @ViewBuilder
    private func detailSection(title: String, icon: String, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Label(title, systemImage: icon)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundStyle(Color.letsGoBlue)

            VStack(alignment: .leading, spacing: 8) {
                ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                    HStack(alignment: .top, spacing: 8) {
                        Text("\(index + 1).")
                            .font(.footnote)
                            .fontWeight(.semibold)
                            .foregroundStyle(.secondary)

                        Text(item)
                            .font(.subheadline)
                            .foregroundStyle(.primary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
