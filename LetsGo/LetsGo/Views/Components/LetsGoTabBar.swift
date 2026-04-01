import SwiftUI

struct LetsGoTabBar: View {
    @Binding var selectedTab: Int

    var body: some View {
        TabView(selection: $selectedTab) {
            Color.clear
                .tabItem {
                    Label("Feed", systemImage: "house.fill")
                }
                .tag(0)

            Color.clear
                .tabItem {
                    Label("Notifications", systemImage: "bell.fill")
                }
                .tag(1)

            Color.clear
                .tabItem {
                    Label("Digest", systemImage: "envelope.fill")
                }
                .tag(2)
        }
    }
}
