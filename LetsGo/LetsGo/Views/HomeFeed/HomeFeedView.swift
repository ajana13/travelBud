import SwiftUI

struct HomeFeedView: View {
    @Environment(AppState.self) private var appState
    @Environment(AppRouter.self) private var router
    @State private var viewModel: HomeFeedViewModel?

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                if let vm = viewModel {
                    let remainingCards = vm.cards.filter { !appState.handledRecommendationIDs.contains($0.id) }

                    if vm.isLoading && vm.cards.isEmpty {
                        ProgressView("Loading recommendations...")
                            .padding(.top, 60)
                    } else if let error = vm.errorMessage, remainingCards.isEmpty {
                        ContentUnavailableView(
                            "Something went wrong",
                            systemImage: "exclamationmark.triangle",
                            description: Text(error)
                        )
                    } else if let currentCard = remainingCards.first {
                        HStack {
                            Text("Itinerary \(appState.handledRecommendationIDs.count + 1) of \(vm.cards.count)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Spacer()
                        }

                        RecommendationCardView(
                            card: currentCard,
                            onTap: {
                                router.navigate(to: .cardDetail(currentCard))
                            },
                            onAction: { actionType in
                                handleAction(actionType, on: currentCard)
                            }
                        )
                    } else {
                        ContentUnavailableView(
                            "You're all caught up",
                            systemImage: "checkmark.circle",
                            description: Text("Refresh to load a new set of itinerary picks.")
                        )
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 20)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("For You")
        .navigationBarTitleDisplayMode(.inline)
        .refreshable {
            await viewModel?.loadFeed()
        }
        .task {
            if viewModel == nil {
                viewModel = HomeFeedViewModel(apiClient: appState.apiClient)
            }
            await viewModel?.loadFeed()
        }
    }

    private func handleAction(_ type: ActionType, on card: RecommendationCard) {
        switch type {
        case .imIn:
            appState.markRecommendationHandled(card)
            appState.registerImIn(card: card)
            Task { await viewModel?.submitQuickAction(.imIn, on: card) }
        case .maybe:
            appState.markRecommendationHandled(card)
            Task { await viewModel?.submitQuickAction(.maybe, on: card) }
        case .pass:
            appState.markRecommendationHandled(card)
            router.navigate(to: .passReasonPicker(card))
        case .cant:
            appState.markRecommendationHandled(card)
            router.navigate(to: .cantReasonPicker(card))
        }
    }
}
