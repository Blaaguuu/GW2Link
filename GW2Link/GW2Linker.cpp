#include "StdAfx.h"
#include <windows.h>
#include <iostream>
#include <math.h>
#include "GW2Linker.h"

#define PI 3.14159265

// Get the status of the linker - if the game is currently sending us data
std::string GW2Linker::getStatus() {
	if(lm->uiTick > lastTick) {
		lastTick = lm->uiTick;
		return "Linked to GW2";
	}
	else {
		return "Not Linked to GW2";
	}
}

// Get the name of the game we are linked to
std::string GW2Linker::getGame() {
	char game[256];
	char defaultChar = ' ';
	WideCharToMultiByte(CP_ACP, 0, lm->name, -1, game, 256, &defaultChar, NULL);
	std::string gameStr(game);
	return gameStr;
}

// Get the name of the player
std::string GW2Linker::getName() {
	char name[256];
	char defaultChar = ' ';
	WideCharToMultiByte(CP_ACP, 0, lm->identity, -1, name, 256, &defaultChar, NULL);
	std::string nameStr(name);
	return nameStr;
}

// Get the GW2 server # from the LinkedMem context
int GW2Linker::getServer() {
	return (lm->context[37] * 256) + lm->context[36];
}

// Get the GW2 map # from the LinkedMem context
int GW2Linker::getMap() {
	return (lm->context[29] * 256) + lm->context[28];
}

// Get the player's X position - East/West
float GW2Linker::getPosX() {
	return floorf(lm->fAvatarPosition[0] * 10 + 0.5) / 10;
}

// Get the player's Y position - Vertical position - probably not terribly useful
float GW2Linker::getPosY() {
	return floorf(lm->fAvatarPosition[1] * 10 + 0.5) / 10;
}

// Get the player's Z position - North/South
float GW2Linker::getPosZ() {
	return floorf(lm->fAvatarPosition[2] * 10 + 0.5) / 10;
}

// Get the player's rotation
int GW2Linker::getPlayerRot() {
	float rot = atan2 (lm->fAvatarFront[2],lm->fAvatarFront[0]) * 180 / PI;
	if(rot < 0.0)
		rot = 360 + rot;
	int deg = int(rot + 0.5);
	return deg;
}

//  Get the camera's rotation
int GW2Linker::getCamRot() {
	float rot = atan2(lm->fCameraFront[2], lm->fCameraFront[0]) * 180 / PI;
	if(rot < 0.0)
		rot = 360 + rot;
	int deg = int(rot + 0.5);
	return deg;
}

GW2Linker::GW2Linker() {
	lm = NULL;
	lastTick = 0;

	std::cout << "Creating File Mapping\n";
	HANDLE hMapObject = CreateFileMappingW(INVALID_HANDLE_VALUE, NULL, PAGE_READWRITE, 0, sizeof(LinkedMem), L"MumbleLink");
	if (hMapObject == NULL) {
		std::cout << "File Mapping Failed\n";
		return;
	}

	lm = (LinkedMem *) MapViewOfFile(hMapObject, FILE_MAP_ALL_ACCESS, 0, 0, sizeof(LinkedMem));
	if (lm == NULL) {
		std::cout << "Failed Mapping View\n";
		CloseHandle(hMapObject);
		hMapObject = NULL;
		return;
	}
}


GW2Linker::~GW2Linker() {
}
