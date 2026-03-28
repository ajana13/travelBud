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

    private var pillarEmoji: String {
        switch card.pillar {
        case .events: "🎶"
        case .dining: "🍴"
        case .outdoors: "⛰"
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Hero image
                LinearGradient(
                    colors: gradientColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .frame(height: 200)
                .overlay {
                    Text(pillarEmoji)
                        .font(.system(size: 60))
                }

                VStack(alignment: .leading, spacing: 18) {
                    // Title + badge
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(card.title)
                                .font(.title2)
                                .fontWeight(.bold)

                            HStack(spacing: 4) {
                                Text(card.location)
                                Text("·")
                                Text(card.availability)
                            }
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        }

                        Spacer()

                        ConfidenceBadge(label: card.confidenceLabel)
                    }

                    // Explanation
                    ExplanationSection(facts: card.explanationFacts)

                    // Tags
                    TagsView(tags: card.tags + [card.priceBand.displayText, card.socialMode])

                    // Primary actions
                    HStack(spacing: 8) {
                        Button {
                            handleAction(.imIn)
                        } label: {
                            Text("I'm in")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(.imInGreen)
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
                            .foregroundStyle(.letsGoBlue)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(.letsGoBlue, lineWidth: 1)
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
            appState.registerImIn(card: card)
            Task { await viewModel?.performAction(.imIn) }
            router.popToRoot()
        case .maybe:
            Task { await viewModel?.performAction(.maybe) }
            router.popToRoot()
        case .pass:
            router.navigate(to: .passReasonPicker(card))
        case .cant:
            router.navigate(to: .cantReasonPicker(card))
        }
    }
}
