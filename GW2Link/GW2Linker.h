#ifndef _GW2LINKER_H_
#define _GW2LINKER_H_

#include <windows.h>
#include <string>

class GW2Linker {
public:
	GW2Linker();
	~GW2Linker();

	struct LinkedMem {
		UINT32	uiVersion;
		DWORD	uiTick;
		float	fAvatarPosition[3];
		float	fAvatarFront[3];
		float	fAvatarTop[3];
		wchar_t	name[256];
		float	fCameraPosition[3];
		float	fCameraFront[3];
		float	fCameraTop[3];
		wchar_t	identity[256];
		UINT32	context_len;
		unsigned char context[256];
		wchar_t description[2048];
	};
	DWORD lastTick;
	std::string getStatus();
	std::string getGame();
	std::string getName();
	int getServer();
	int getMap();

	float getPosX();
	float getPosY();
	float getPosZ();
	int getPlayerRot();
	int getCamRot();
	
	LinkedMem *lm;
};

#endif
