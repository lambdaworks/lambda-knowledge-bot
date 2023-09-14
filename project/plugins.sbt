addSbtPlugin("ch.epfl.scala"  % "sbt-scalafix"        % "0.11.0")
addSbtPlugin("org.scalameta"  % "sbt-scalafmt"        % "2.5.0")
addSbtPlugin("nl.gn0s1s"      % "sbt-dotenv"          % "3.0.0")
addSbtPlugin("com.github.sbt" % "sbt-native-packager" % "1.9.16")

libraryDependencies += "ai.kien" %% "python-native-libs" % "0.2.4"
