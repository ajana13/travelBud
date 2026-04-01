import SwiftUI

@main
struct LetsGoApp: App {
    @State private var appState = AppState()
    @State private var router = AppRouter()
    @State private var selectedTab = 0

    var body: some Scene {
        WindowGroup {
            TabView(selection: $selectedTab) {
                NavigationStack(path: $router.path) {
                    HomeFeedView()
                        .navigationDestination(for: Route.self) { route in
                            routeDestination(route)
                        }
                }
                .tabItem {
                    Label("Feed", systemImage: "house.fill")
                }
                .tag(0)

                NavigationStack {
                    NotificationPreviewView()
                }
                .tabItem {
                    Label("Notifications", systemImage: "bell.fill")
                }
                .tag(1)

                NavigationStack {
                    WeeklyDigestView()
                }
                .tabItem {
                    Label("Digest", systemImage: "envelope.fill")
                }
                .tag(2)
            }
            .tint(.letsGoBlue)
            .environment(appState)
            .environment(router)
            .sheet(isPresented: $appState.showPostActivitySheet) {
                if let card = appState.pendingPostActivityCards.first {
                    PostActivityConfirmationView(card: card)
                        .environment(appState)
                }
            }
            .onChange(of: selectedTab) {
                // Trigger post-activity check when returning to feed
                if selectedTab == 0 {
                    appState.triggerPostActivityIfNeeded()
                }
            }
        }
    }

    @ViewBuilder
    private func routeDestination(_ route: Route) -> some View {
        switch route {
        case .cardDetail(let card):
            CardDetailView(card: card)
        case .passReasonPicker(let card):
            PassReasonPickerView(card: card)
        case .cantReasonPicker(let card):
            CantReasonPickerView(card: card)
        case .followUpLearning(let card):
            FollowUpLearningView(card: card)
        case .postActivityConfirmation(let card):
            PostActivityConfirmationView(card: card)
        case .notificationPreview:
            NotificationPreviewView()
        case .weeklyDigest:
            WeeklyDigestView()
        }
    }
}
