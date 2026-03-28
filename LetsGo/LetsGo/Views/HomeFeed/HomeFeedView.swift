import SwiftUI

struct HomeFeedView: View {
    @Environment(AppState.self) private var appState
    @Environment(AppRouter.self) private var router
    @State private var viewModel: HomeFeedViewModel?

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 14) {
                if let vm = viewModel {
                    if vm.isLoading && vm.cards.isEmpty {
                        ProgressView("Loading recommendations...")
                            .padding(.top, 60)
                    } else if let error = vm.errorMessage, vm.cards.isEmpty {
                        ContentUnavailableView(
                            "Something went wrong",
                            systemImage: "exclamationmark.triangle",
                            description: Text(error)
                        )
                    } else {
                        ForEach(vm.cards) { card in
                            RecommendationCardView(
                                card: card,
                                onTap: {
                                    router.navigate(to: .cardDetail(card))
                                },
                                onAction: { actionType in
                                    handleAction(actionType, on: card)
                                }
                            )
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 20)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("For You")
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
            appState.registerImIn(card: card)
            Task { await viewModel?.submitQuickAction(.imIn, on: card) }
        case .maybe:
            Task { await viewModel?.submitQuickAction(.maybe, on: card) }
        case .pass:
            router.navigate(to: .passReasonPicker(card))
        case .cant:
            router.navigate(to: .cantReasonPicker(card))
        }
    }
}
