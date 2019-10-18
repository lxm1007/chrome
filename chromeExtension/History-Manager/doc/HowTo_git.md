# Quick Start

First time set up.

#### 1. `git clone http://vstfsng01:8080/tfs/PlayGround/ASE_Course/_git/X-Space`

User name and password will be required. Use the email address (with domain name) and its password.

The repo directory will then be copied to your *current path*.

There will be master branch only.

#### 2. `git checkout -b develop`

Create a new branch for *develop*.

*-b option means to create the new branch if the branch cannot be found locally.*

#### 3. `git pull origin develop`

Pull the latest version of develop branch to local.

#### 4. `git checkout -b <your_new_branch>`

Create a new branch to add new code.

**Important:** Before any commits, set your name and email first using the command:

`git config user.name "<your_name>"`

`git config user.email "<your_email>"`

The name can be a nick name, which will show in the history commits to identify the contributor.

Start coding~~~

# Introduction

Git will record every version of your project.

When you *commit* the change, it's like pressing the camera button and creating a snapshot(version) of your current project state.

![version(snapshot)](https://git-scm.com/book/en/v2/book/01-introduction/images/deltas.png)

**One commit --> One version**

Git allows you to decide what you want to record in the version.

So it define a *staging area*.

Only changes in *staging area* will be adopted into the new version.

So after you have done some updates, you should *stage* the change or *add* the new file to the staging area. And then, do the *commit*.

This picture shows the life cycle of files in the gir repository. If you understand the picture below, you knows (almost) everything about git local work.

![record change](https://git-scm.com/book/en/v2/book/02-git-basics/images/lifecycle.png)

* Common command:
    - **Untracked --> Staged**: `git add <new_file_name>`
    - **Unmodified --> Modified**: git automatically record the change you've made
    - **Modified --> Staged**: `git stage <modified_file_name>`
    - **Staged --> Unmodified**: `git commit`, git will store all current change as a history version and start a new version after the commit.

**Important:** You can use `git status` to check the current repository status (refer to the chapter *Checking the Status of Your Files* in the git manual).

When several people cooperate together, we use *branch*.

# Reference

* https://progit2.s3.amazonaws.com/en/2016-03-22-f3531/progit-en.1084.pdf

You can search any command (by chapter) in this manual, easy and fast.
