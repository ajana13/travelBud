// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "LetsGo",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "LetsGo",
            targets: ["LetsGo"]
        )
    ],
    targets: [
        .target(
            name: "LetsGo",
            path: "LetsGo",
            exclude: ["Assets.xcassets", "Preview Content"],
            sources: [
                "App",
                "Models",
                "Networking",
                "Services",
                "Extensions",
                "Views",
                "ViewModels"
            ]
        ),
        .testTarget(
            name: "LetsGoTests",
            dependencies: ["LetsGo"],
            path: "LetsGoTests"
        )
    ]
)
